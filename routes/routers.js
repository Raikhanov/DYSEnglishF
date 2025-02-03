const express = require("express")
const mongoose = require("mongoose")
const router = express.Router();
const app = express()
app.set('view engine','ejs')
app.use(express.static('public/view'));  



router.get('/admin',(req,res)=>{
    res.render('admin')
})



router.get('/quiz',(req,res)=>{
    res.render('quiz')
})

router.get('/', (req, res) => {
    const user = req.user || null;

    res.render('index', { user });
});

router.get('/about',(req,res) =>{
    res.render('about')
})


router.get('/blog_details',(req,res) =>{
    res.render('blog_details')
})

router.get('/contact',(req,res) =>{
    res.render('contact')
})

router.get('/courses',(req,res) =>{
    res.render('courses')
})

router.get('/elements',(req,res) =>{
    res.render('elements')
})

router.get('/login',(req,res) =>{
    res.render('login')
})

router.get('/main',(req,res) =>{
    res.render('main')
})


router.get('/negizgi',(req,res) =>{
    res.render('negizgi')
})

router.get('/register',(req,res) =>{
    res.render('register')
})  

router.get('/buy_course', (req,res) =>{
    res.render('buy_course')
})
router.get('/urok',(req,res) =>{
    res.render('urok')
})
router.get('/materials',(req,res) =>{
    res.render('materials')
})

router.get('/not_found_users', (req,res) =>{
    res.render('not_found_users')
})

module.exports = router;