const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const bcrypt = require("bcrypt")
const config = require("./models/config")
const collection = require("./models/config")
const app = express()
const Material = require("./models/materials")
const session = require("express-session")
const multer = require("multer");
const Purchase = require("./models/purchase")
const profile = require("./models/profile");
const bodyParser = require("body-parser");
const routes = require("./routes/routers")
const auth = require('./models/auth')
const passport = require("passport");
const User = require('./models/user');
const quizRouter = require('./routes/quiz')

const purchaseRoutes = require("./routes/purchase");

require('dotenv').config();

app.use('/',routes)
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

app.set('view engine','ejs')
app.use(express.static('public'));  


// Express-session
app.use(session({secret: 'cats'
    ,resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))
app.use(passport.initialize())
app.use(passport.session())

//**puchase */


//**QUIZZZ */
app.use("/quiz", quizRouter); 




app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/purchase", purchaseRoutes);
// Auth Google

function isLoggedIn(req,res,next){
    req.user ? next() : res.sendStatus(401)
}

app.get('/blog',isLoggedIn,(req,res) =>{
    res.render('blog')
})

app.get('/auth/google', 
    passport.authenticate('google',{ scope: ['email', 'profile']}
))

app.get('/google/callback',
    passport.authenticate('google',{
        successRedirect: '/profile',
        failureRedirect: '/auth/failure'
    })
)

app.get('/app/failure',(req,res)=>{
    res.send('something went wrong')
})


app.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error during logout:", err);
            return next(err);
        }
        res.redirect('/');
    });
});

//convert data in json format
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use(express.static('public'))


app.get("/profile", ensureAuthenticated, async(req, res) => {
    try {
        // Предполагаем, что `req.session.user` содержит ID авторизованного пользователя
        const userId = req.session.user.id;

        // Получаем данные пользователя из MongoDB
        const user = await collection.findOne({ _id: userId });
        const purchases = await Purchase.find({ userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Передаём данные в шаблон EJS
        res.render("profile", { user, purchases });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.send("Error fetching user data");
    }
});



function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect("/login");
}


// Delete accounts
app.post("/deleteAccount", async (req, res) => {
    try {
        const userId = req.session.user.id;

        if (!userId) {
            return res.status(401).send("Unauthorized: User not logged in.");
        }

        // Удаление пользователя из базы данных
        const result = await collection.deleteOne({ _id: userId });

        if (result.deletedCount === 0) {
            return res.status(404).send("Account not found.");
        }

        // Удаляем сессию пользователя
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.status(500).send("Error during account deletion.");
            }

            res.send("Account successfully deleted.");
        });
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).send("An error occurred.");
    }
});

// update email
app.post("/updateEmail", async (req, res) => {
    try {
        const userId = req.session.user.id; // Получаем ID пользователя из сессии
        const newEmail = req.body.email;   // Получаем новый email из тела запроса

        if (!userId) {
            return res.status(401).send("Unauthorized: User not logged in.");
        }

        // Проверяем, существует ли уже пользователь с таким email
        const existingUser = await collection.findOne({ email: newEmail });
        if (existingUser) {
            return res.status(400).send("Email already in use by another account.");
        }

        // Обновляем email в базе данных
        const result = await collection.updateOne(
            { _id: userId },         // Условие поиска
            { $set: { email: newEmail } } // Обновление поля email
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send("Failed to update email. User not found.");
        }
        res.redirect("/profile");
    } catch (error) {
        console.error("Error updating email:", error);
        res.status(500).send("An error occurred.");
    }
});


// Register
app.post("/register", async(req,res)=>{
    const data = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password.trim(),
    }
    const existingUser = await collection.findOne({email: data.email})
    if(existingUser){
        return res.status(404).render("not_found_users");
    }else{
        // hash the password using bcrypt 
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds)
        data.password = hashedPassword // Replace the hash password with original password
        const userdata = await collection.insertMany([data])
        res.redirect('/login')
    }


})




//  // Делаем пользователя доступным для шаблонов

app.use((req, res, next) => {
    // Если в сессии есть данные о пользователе, передаем их в локальные переменные
    if (req.session.user) {
        res.locals.user = req.session.user;  // Делаем данные доступными во всех шаблонах
    } else {
        res.locals.user = null;  // Если пользователя нет в сессии, передаем null
    }
    next();  // Переходим к следующему middleware или маршруту
});





// Login User
app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ email: req.body.email });
        if (!check) {
            return res.status(404).render("not_found");
        }
        
        // Сравнение пароля
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (isPasswordMatch) {
            // Сохраняем данные пользователя в сессии
            req.session.user = {  
                id: check._id,
                email: check.email };
            

            return res.redirect("/profile");
        } else {
            return res.send("Wrong password");
        }
    } catch (error) {
        console.error("Error during login:", error);
        return res.send("Something went wrong");
    }
});


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./uploads/materials"); // Папка для загрузки
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
    }
  });
  
  const upload = multer({ storage: storage });
  
app.post("/admin/upload", upload.single("materialFile"), async (req, res) => {
    try {
      const newMaterial = new Material({
        title: req.body.title,
        description: req.body.description,
        filePath: req.file.path,
        fileType: req.file.mimetype,
      });
  
      await newMaterial.save();
      res.redirect("/admin"); // Перенаправление после загрузки
    } catch (err) {
      console.error(err);
      res.status(500).send("Ошибка при загрузке материала");
    }
  });

// Роут для отображения всех материалов
app.get("/admin/materials", async (req, res) => {
    try {
      const materials = await Material.find();
      res.render("materials", { materials }); // Отображаем все материалы
    } catch (err) {
      console.error(err);
      res.status(500).send("Ошибка при загрузке материалов");
    }
  });

// Роут для скачивания материала
app.get("/download/:id", async (req, res) => {
    try {
      const material = await Material.findById(req.params.id);
      if (!material) {
        return res.status(404).send("Материал не найден");
      }
      res.download(material.filePath); // Скачивание файла
    } catch (err) {
      console.error(err);
      res.status(500).send("Ошибка при скачивании материала");
    }
  });

  



const PORT = process.env.PORT
app.listen(PORT,()=>{
    console.log(`Server's Started: http://localhost:${PORT}`)
})



