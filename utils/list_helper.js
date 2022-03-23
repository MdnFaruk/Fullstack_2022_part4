const dummy = blogs => {
    return 1
  }

const totalLikes = blogs => blogs.reduce((t,{likes}) => t + likes,0)

const favoriteBlog = blogs => {
  const maxLike = Math.max.apply(null,Object.values(blogs).map(element => element.likes))
  const {_id,__v,url,...rest} = blogs.find(element => element.likes === maxLike)
  return rest
}

const mostBlogs = blogs => {
  const authors = {};
  const authorList = Object.values(blogs).map(b => b.author)
  authorList.forEach(element => { authors[element] = (authors[element] || 0) + 1});
  const maxBlog = Math.max(...Object.values(authors))
  const maxBlogAuthor = Object.entries(authors).filter(element => element[1] === maxBlog)[0]
  return {author:maxBlogAuthor[0],blogs:maxBlogAuthor[1]}
}

const mostLikes = blogs => {
  const maxLike = Math.max.apply(null,Object.values(blogs).map(element => element.likes))
  const {_id,__v,url,title,...rest} = blogs.find(element => element.likes === maxLike)
  return rest
}

module.exports = {
  dummy, 
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}