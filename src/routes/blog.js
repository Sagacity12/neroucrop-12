
import express from 'express';
import Blog from '../models/blogmodel.js';

// import cors from 'cors';
const router=express.Router()


router.use(express.json())
// router.use(cors)


// retrive all blogpost
router.get('/',async (req,res)=>{
    try {
    const blogpost=await Blog.find()
    res.json({message:blogpost})
} catch (e) {
    res.status(404).json({message:`Error ${e.message}`})
    
}})

// find specific blogpost
router.get('/:id',async (req,res)=>{
    try {
    const blogpost=await Blog.findById(req.params.id)
    res.json({message:blogpost})
} catch (e) {
    res.status(404).json({message:`Error ${e.message}`})
    
}})

// add a blogpost
router.post('/',async (req,res)=>{
    try {
        let {user,media,likes,comments,tags,categories}=req.body

        //tag validation
        tags = tags 
        ? [...new Set(tags.split(/\s+/).map(tag => tag.startsWith('#') ? tag : `#${tag}`))]
        : [];

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

// get all comments
router.get('/comments/:id',async(req,res)=>{
    try{
        const blogpost=await Blog.findById(req.params.id)
    res.json({message:blogpost.comments})

    }catch(e){
        res.status(404).json({message:`Error ${e.message}`})
    }
})


// add a comment
router.patch('/comments/:id', async (req, res) => {
    try {
        const { comment } = req.body;
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const newComment = {
            // commenters id is attached to comment
            user: req.user.id, 
            content: comment
        };

        blog.comments.push(newComment);
        await blog.save();

        res.json({ message: "Comment added successfully", comments: blog.comments });
    } catch (e) {
        res.status(500).json({ message: `Error: ${e.message}` });
    }
});


// update blogpost
router.put('/:id',async (req,res)=>{
    try {
        let {user,media,likes,comments,tags,categories}=req.body

        //tag validation
        tags = tags 
        ? [...new Set(tags.split(/\s+/).map(tag => tag.startsWith('#') ? tag : `#${tag}`))]
        : [];

    const updatedBlog= await Blog.findByIdAndUpdate(req.params.id,{
        user:user,
        media:media,
        likes:likes,
        comments:comments,
        tags:tags,
        categories:categories
    },{new:true})

    if (!updatedBlog) return res.status(400).json({message:'Blog does not exist'});
    res.status(201).json({message:'Blog Updated'})

} catch (e) {
    res.status(404).json({message:`Error ${e.message}`})
    
}})

// delete blogpost
router.delete('/:id',async (req,res)=>{
    try {
    const blogpost=await Blog.findByIdAndDelete(req.params.id);

    if (!blogpost) return res.status(404).json({message:'Blog is missing'});
    res.status(204).json({message:'Blog Deleted successfully'})

} catch (e) {
    res.status(404).json({message:`Error ${e.message}`})
    
}})

export default router;

