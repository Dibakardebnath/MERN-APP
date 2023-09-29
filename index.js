const express = require('express')
const { connection } = require('./cofig/db')
// const bcrypt = require('bcrypt');
const {SignUpModels}=require('./Models/SignupModel')
var jwt = require('jsonwebtoken');
const { UserModel } = require('./Models/UserModel');
const { Auth } = require('./Authentication/Auth');
var cors=require('cors');

const app= express()

app.use(cors({
    origin : "*"
  }))
  

app.use(express.json())

app.get("/", async(req, res) => {
   const { category, sortby, order, page, limit } = req.query;

   const pageNo = parseInt(page);
   const limitPerPage = parseInt(limit);
   const skip = (pageNo - 1) * limitPerPage;
 
   try {
     let filter = {};
     if (category) {
       filter.category = { $regex: category, $options: "i" };
     }
 
     let query = UserModel.find(filter);
 
     if (sortby && order) {
       let ordering = order === "asc" ? 1 : -1;
       let sortObj = {};
       sortObj[sortby] = ordering;
       query = query.sort(sortObj);
     }
 
     if (limitPerPage) {
       query = query.skip(skip).limit(limitPerPage);
     }
    
     const users = await query.exec();
     const total = await UserModel.countDocuments(filter);
   
     res.status(200).json({ users,total });
    
    
   } catch (error) {
     res.status(500).json({ msg: error });
   }
})

app.post("/signup", async(req, res) => {
    const {name,email,password} = req.body;
    // const hash = bcrypt.hashSync(password, 5);
    try {
        const signuser=new SignUpModels({
            name: name,
            email: email,
            password:password
        })
        await signuser.save()
        res.status(200).json({msg:"Successfully signed"})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg:"Error signing"})
    }
})


app.post("/login",async(req, res) => {

    const { email, password}=req.body
       const user=await SignUpModels.findOne({email:email})
       const userPassword=user.password
      console.log(userPassword,password)
       if(!user){
        res.status(404).json({msg:"Sign Up First"})
       }else{
        // console.log(user._id)
        if(userPassword===password){
          var token = jwt.sign({ user_id:user._id }, 'Dibakar');
          res.status(200).json({msg:"Signup Successfully",token:token})
       
          
        }
      
       }
})

// app.get("/dashboard",Auth, async (req, res) => {
//     const { category, sortby, order, page, limit } = req.query;

//     const author_id=req.user_id
//     const newId=await UserModel.find({user_id:author_id})
//     console.log(newId)
//     const pageNo = parseInt(page);
//     const limitPerPage = parseInt(limit);
//     const skip = (pageNo - 1) * limitPerPage;
  
//     try {
//       let filter = {};
//       if (category) {
//         filter.category = { $regex: category, $options: "i" };
//       }
  
//       let query = UserModel.find(filter);
  
//       if (sortby && order) {
//         let ordering = order === "asc" ? 1 : -1;
//         let sortObj = {};
//         sortObj[sortby] = ordering;
//         query = query.sort(sortObj);
//       }
  
//       if (limitPerPage) {
//         query = query.skip(skip).limit(limitPerPage);
//       }
     
//       const users = await query.exec();
//       const total = await UserModel.countDocuments(filter);
//      if(newId){
//       res.status(200).json({ newId });
//      }else{
//       res.status(404).json({"msg":"login first"})
//      }
     
//     } catch (error) {
//       res.status(500).json({ msg: error });
//     }
//   });
app.get("/dashboard", Auth, async (req, res) => {
  const { category, sortby, order, page, limit } = req.query;
  const author_id = req.user_id;
  const pageNo = parseInt(page);
  const limitPerPage = parseInt(limit);
  const skip = (pageNo - 1) * limitPerPage;

  try {
    let filter = { user_id: author_id }; // Filter by the currently logged-in user's ID

    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    let query = UserModel.find(filter);

    if (sortby && order) {
      let ordering = order === "asc" ? 1 : -1;
      let sortObj = {};
      sortObj[sortby] = ordering;
      query = query.sort(sortObj);
    }

    if (limitPerPage) {
      query = query.skip(skip).limit(limitPerPage);
    }

    const users = await query.exec();
    const total = await UserModel.countDocuments(filter);

    // Send the response with pagination information
    res.status(200).json({ users, total, page: pageNo });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
});


app.get("/dashboard/:id", Auth, async (req, res) => {
  
  const id=req.params.id
   

    const user_id=req.user_id
    const signUser=await SignUpModels.findOne({_id:user_id})
    const signUser_email=signUser.email

    const user=await UserModel.findOne({_id:id})
    const user_email=user.email
     console.log(user_email,signUser_email)

    if(signUser_email!=user_email){
        res.status(404).json({msg: 'Invalid email address'})
    }else{
        const data=await UserModel.findById(id)
        res.status(200).json({data}) 
    }

  
});



app.post("/create",Auth,async(req, res) => {
    const { title,category,description}=req.body

    const author_id=req.user_id

    const newId=await SignUpModels.findOne({_id:author_id})
   
    const blog=new UserModel({
        email:newId.email,
        title:title,
        category:category,
        description:description,
        user_id:author_id
    })
    await blog.save()
    res.status(200).json({msg:"Successfully created"})
})


app.put("/update/:id",Auth, async (req, res) => {
    const id=req.params.id
    const payload=req.body

    const user_id=req.user_id
    const signUser=await SignUpModels.findOne({_id:user_id})
    const signUser_email=signUser.email

    const user=await UserModel.findOne({_id:id})
    const user_email=user.email


    if(signUser_email!=user_email){
        res.status(404).json({msg: 'Invalid email address'})
    }else{
        await UserModel.findByIdAndUpdate(id,payload)
        res.status(200).json({msg: `blog ${id} updated successfully`}) 
    }



})

app.delete("/delete/:id",Auth, async (req, res) => {
    const id=req.params.id
   console.log("yes")

    const user_id=req.user_id
    const signUser=await SignUpModels.findOne({_id:user_id})
    const signUser_email=signUser.email

    const user=await UserModel.findOne({_id:id})
    const user_email=user.email

console.log(user_email,signUser_email)

    if(signUser_email!=user_email){
        res.status(404).json({msg: 'Invalid email address'})
    }else{
        await UserModel.findByIdAndDelete(id)
        res.status(200).json({msg: `blog ${id} deleted successfully`}) 
    }



})





app.listen(8000,async()=>{
    await connection
    try {
        console.log("connection established")
    } catch (error) {
        console.log(error)
    }
})





/*
[
  {
    "title": "Mastering the Art of Web Design",
    "category": "Web Development",
    "description": "Learn the principles of effective web design and create stunning websites."
  },
  {
    "title": "Innovations in Artificial Intelligence",
    "category": "Technology",
    "description": "Exploring the latest advancements and applications of AI in various industries."
  },
  {
    "title": "Exploring Underwater Worlds: Scuba Diving Adventures",
    "category": "Travel",
    "description": "Dive into the depths of the oceans and discover the wonders of marine life."
  },
  {
    "title": "Delicious Desserts from Around the World",
    "category": "Food",
    "description": "Indulge your sweet tooth with a collection of delectable desserts from different cultures."
  },
  {
    "title": "Brush Strokes and Canvases: A Painter's Journey",
    "category": "Art",
    "description": "Follow an artist's creative journey through various painting techniques and styles."
  },
  {
    "title": "Mindfulness and Meditation for Inner Peace",
    "category": "Health",
    "description": "Discover the benefits of mindfulness practices and meditation for a calm mind."
  },
  {
    "title": "Getting Started with Python Programming",
    "category": "Programming",
    "description": "A beginner-friendly guide to learning Python, a versatile programming language."
  }
]



*/