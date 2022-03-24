const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require("../models/blog");
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs ')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

test('unique identifier property should be id', async () => {
    const blogs = await helper.blogsInDb()
    expect(blogs[0].id).toBeDefined()
})  

test('created a blog post successfully', async () => {
    const newblog = {
        title: "Physics",
        author: "Md",
        url: "http://wikipedia.com",
        likes: 98,
      }
  
    await api
      .post('/api/blogs')
      .send(newblog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  
    const titleList = blogsAtEnd.map(n => n.title)
    expect(titleList).toContain('Physics')
  })

  test('default like value 0, for missing like value request', async () => {
    const newblog = {
        title: "Math",
        author: "Haque",
        url: "http://gitmedia.com",
      }
  
    const response = await api
      .post('/api/blogs')
      .send(newblog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(response.body.likes).toEqual(0)
  })

  describe('url and title missing',() => {
    
    test('url missing', async () => {
        const newblog1 = {
            title: "Biology",
            author: "Haque",
            likes: 13,
          }
        await api
            .post('/api/blogs')
            .send(newblog1)
            .expect(400)
    })
    
    test('title missing', async () => {
        const newblog2 = {
            author: "Haque",
            url: "http://www.com",
            likes: 13,
          }
        await api
          .post('/api/blogs')
          .send(newblog2)
          .expect(400)
    })
  })

afterAll(() => {
    mongoose.connection.close()
})