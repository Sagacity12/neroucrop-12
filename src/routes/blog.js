
import express from 'express';
import Blog from '../models/blogmodel.js';

// import cors from 'cors';
const router=express.Router()


router.use(express.json())
// router.use(cors)

router.get('/',async (req,res)=>{
    try {
    const blogpost=await Blog.find()
    res.json({message:blogpost})
} catch (e) {
    res.status(404).json({message:`Error ${e.message}`})
    
}})

router.post('/',async (req,res)=>{
    try {
        let {user,media,likes,comments,tags,categories}=req.body

        //tag validation
    tags=[...new Set(tags.split(/\s+/).map(tag => tag.startsWith('#') ? tag : `#${tag}`))]

    const blogpost=new Blog({
        user:user,
        media:media,
        likes:likes,
        comments:comments,
        tags:tags,
        categories:categories
    })
    await blogpost.save()
    res.status(201).json({message:'New blog posted'})
} catch (e) {
    res.status(404).json({message:`Error ${e.message}`})
    
}})

router.patch('/:id',async (req,res)=>{
    try {
      let {comment}=req.body
      const blog=await Blog.findById(req.params.id);

      const newComment={
        // need to get user id for this
        user:req.user.id,
        content:comment
      }

      blog.comment.push(newComment);
      await blog.save();

      res.json({ message: "Comment added successfully", comments: blog.comments });
} catch (e) {
    res.status(404).json({message:`Error ${e.message}`})
    
}})

router.put('/:id',async (req,res)=>{
    try {
        let {user,media,likes,comments,tags,categories}=req.body

        //tag validation
    tags=[...new Set(tags.split(/\s+/).map(tag => tag.startsWith('#') ? tag : `#${tag}`))]

    const updatedBlog= await Blog.findByIdAndUpdate(req.params.id,{
        user:user,
        media:media,
        likes:likes,
        comments:comments,
        tags:tags,
        categories:categories
    },{new:true})

    if (!updatedBlog) return res.status(400).json({message:'Item does not exist'});
    res.status(201).json({message:'Blog Updated'})

} catch (e) {
    res.status(404).json({message:`Error ${e.message}`})
    
}})

router.delete('/:id',async (req,res)=>{
    try {
    const blogpost=await Blog.findByIdAndDelete(req.params.id);

    if (!blogpost) return res.status(404).json({message:'Blog is missing'});
    res.status(201).json({message:'Blog Deleted successfully'})

} catch (e) {
    res.status(404).json({message:`Error ${e.message}`})
    
}})

export default router;

