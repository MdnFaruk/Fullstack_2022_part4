const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require("../models/blog");
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)

describe('when there is initially some blogs saved', () => {

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

  describe('url and title missing', () => {

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

  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const titleList = blogsAtEnd.map(r => r.title)

    expect(titleList).not.toContain(blogToDelete.title)
  })

  test('a blog can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const updateLikes = { likes: 54 }
    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updateLikes)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.likes).toBe(54)
  })
})
describe('when there is initially one user in db', () => {

  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'faruk',
      name: 'md',
      password: 'mdfaruk',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('invalid user is not created', async () => {
    const newUser = {
      username: '',
      name: 'md',
      password: 'mdfaruk',
    }
    const response = await api
      .post(`/api/users`)
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toBe('username and password are required')
  })

  test('password and username is not 3 characters long', async () => {
    const newUser = {
      username: 'faruk',
      name: 'md',
      password: 'io',
    }
    const response = await api
      .post(`/api/users`)
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toBe('username and password must be at least 3 characters long')
  })
})

afterAll(() => {
  mongoose.connection.close()
})