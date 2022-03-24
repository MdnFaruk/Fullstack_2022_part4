const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', (request, response) => {
    Blog
      .find({})
      .then(blogs => {
        response.json(blogs)
      }).catch(error => next(error))
  })
  
blogsRouter.post('/', (request, response,next) => {
  const blog = new Blog(request.body)
  blog.likes = blog?.likes ?? 0
  response = (blog?.title && blog?.url) ?? response.status(400).json('title or url missing')
  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    }).catch(error => next(error))
})

blogsRouter.get('/:id', (request, response, next) => {
  Blog.findById(request.params.id)
    .then(blog => {
      if (blog) {
        response.json(blog)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

module.exports = blogsRouter