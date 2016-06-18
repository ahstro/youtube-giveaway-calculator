import getIdFromUrl from 'get-youtube-id'

const URL = 'https://www.youtube.com/watch?v=jPZZAavOugo'
const YOUTUBE_API_KEY = 'AIzaSyDc9FiNUYZ68YCCv90rdQiRjDtl_I4Y3l0'
// const YOUTUBE_API_KEY = 'AIzaSyDSyhVknRK5OA5zNvjoNYAPzFe9K-T3wO4'
const MAX_RESULTS = 100
const BASE_API_URL = `https://www.googleapis.com/youtube/v3/commentThreads?part=id%2Csnippet&maxResults=${MAX_RESULTS}&key=${YOUTUBE_API_KEY}`

function getCommenters (comments) {
  // Reduce the comments array to an map of ids to
  // display names by destructuring the comment objects
  // This has the added bonus only letting each user
  // appear once, since the id/key is overwritten if
  // it occurs multiple times
  return comments.reduce((t, {
    snippet: {
      topLevelComment: {
        snippet: {
          authorDisplayName,
          authorChannelUrl,
        },
      },
    },
  }) => ({ ...t, [authorChannelUrl]: authorDisplayName }), {})
}

function getApiUrl (videoId, pageToken) {
  return pageToken
    ? `${BASE_API_URL}&videoId=${videoId}&pageToken=${pageToken}`
    : `${BASE_API_URL}&videoId=${videoId}`
}

function setResult ({ name, url }) {
  const markup = `<a href=${url}>${name}</a>`
  const elem = document.getElementById('result')
  elem.innerHTML = `The winner is: ${markup}`
  document.getElementById('loading').style.display = 'none'
  elem.style.display = 'block'
}

function getResult (commenters) {
  const keys = Object.keys(commenters)
  const rand = Math.floor(Math.random() * keys.length)
  const key = keys[rand]
  return {
    name: commenters[key],
    url: key,
  }
}

function loading () {
  document.getElementById('result').style.display = 'none'
  document.getElementById('loading').style.display = 'block'
}

function getWinner () {
  loading()
  const videoId = getIdFromUrl(URL)
  let commenters = {}

  function getData (apiUrl) {
    window.fetch(apiUrl)
      .then(res => res.json())
      .then(({ nextPageToken, items }) => {
        commenters = { ...commenters, ...getCommenters(items) }
        if (nextPageToken) {
          console.log(Object.keys(commenters).length, ' potential winners so far')
          getData(getApiUrl(videoId, nextPageToken))
        } else {
          const result = getResult(commenters)
          console.log('A winrar is ', result.name, '! ', result.url)
          setResult(result)
        }
      })
  }

  getData(getApiUrl(videoId))
}

document.getElementById('button').addEventListener('click', getWinner)
