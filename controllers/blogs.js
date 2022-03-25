const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({}).populate('user',{blogs:0})
    response.json(blogs)
  } catch (exception) {
    next(exception)
  }
    
})
  
blogsRouter.post('/', async (request, response,next) => {
  const user = await User.findById(request.body.userId)
  const blog = new Blog({...request.body,user: user._id})

  blog.likes = blog?.likes ?? 0
  if (!(blog?.title && blog?.url)) response.status(400).json('title or url missing')
  try {
    const savedBlog = await blog.save()
    user.blogs = [...user.blogs, savedBlog._id]  
    await user.save()
    response.status(201).json(savedBlog)
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
      response.json(blog)
    } else {
      response.status(404).end()
    }
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }
  try {
    const updatedNote = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedNote)
  } catch (exception) {
    next(exception)
  }
 
})

module.exports = blogsRouter