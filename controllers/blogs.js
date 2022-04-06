const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const {userExtractor} = require('../utils/middleware')

/* const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
} */

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', { blogs: 0 })
    response.json(blogs)
  } catch (exception) {
    next(exception)
  }

})
//register a middleware userExtractor only for a specific operation
blogsRouter.post('/',userExtractor, async (request, response, next) => {
  //const user = await User.findById(request.body.userId)
  //const token = getTokenFrom(request)
  //const decodedToken = jwt.verify(token, process.env.SECRET)
  try { 
    
    /* const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id) */
    const user = request.user
    const blog = new Blog({ ...request.body, user: user._id })

    blog.likes = blog?.likes ?? 0
    if (!(blog?.title && blog?.url)) {
      return response.status(400).json({error: 'title or url missing'})
    }
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

blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    
    /*     if (!decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    } */
    const user = request.user
    if (blog.user.toString() === user.id){
      await Blog.findByIdAndRemove(request.params.id)
      await User.findOneAndUpdate(
        { username: decodedToken.username },
        { $pull: { blogs: { $in:[request.params.id] }} },
        { new: true }
      )
      response.status(204).end()
    } else {
      response.status(401).end()
    }
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