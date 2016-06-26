import getIdFromUrl from 'get-youtube-id'

const YOUTUBE_API_KEY = 'AIzaSyDc9FiNUYZ68YCCv90rdQiRjDtl_I4Y3l0'
const MAX_RESULTS = 100
const BASE_API_URL = `https://www.googleapis.com/youtube/v3/commentThreads?part=id%2Csnippet&maxResults=${MAX_RESULTS}&key=${YOUTUBE_API_KEY}`

function getCommenters (comments) {
  // Reduce the comments array to an map of ids to
  // display names by destructuring the comment objects
  // This has the added bonus only letting each user
  // appear once, since the id/key is overwritten if
  // it occurs multiple times
  return comments.reduce((t, {
    id: commentId,
    snippet: {
      topLevelComment: {
        snippet: {
          authorDisplayName,
          authorChannelUrl,
        },
      },
    },
  }) => ({
    ...t,
    [authorChannelUrl]: {
      name: authorDisplayName,
      commentId,
    },
  }), {})
}

function getApiUrl (videoId, pageToken) {
  return pageToken
    ? `${BASE_API_URL}&videoId=${videoId}&pageToken=${pageToken}`
    : `${BASE_API_URL}&videoId=${videoId}`
}

function setResult ({ name, commentId }, videoUrl) {
  const url = `${videoUrl}&lc=${commentId}`
  const markup = `<a href=${url}>${name}</a>`
  const elem = document.getElementById('result')
  elem.innerHTML = `The winner is: ${markup}`
  document.getElementById('loading').style.display = 'none'
  elem.style.display = 'block'
}

function getResult (commenters) {
  const keys = Object.keys(commenters)
  const rand = Math.floor(Math.random() * keys.length)
  return commenters[keys[rand]]
}

function loading () {
  document.getElementById('result').style.display = 'none'
  document.getElementById('loading').style.display = 'block'
}

function getWinner () {
  loading()
  const url = document.getElementById('url').value
  const videoId = getIdFromUrl(url)

  if (!videoId) {
    document.getElementById('loading').innerHTML = 'Invalid URL'
    return
  }

  let commenters = {}

  function getData (apiUrl) {
    window.fetch(apiUrl)
      .then(res => res.status === 200 && res.json())
      .then(json => {
        if (!json) {
          document.getElementById('loading').innerHTML = 'Something went wrong..'
          return null
        }
        const { nextPageToken, items } = json
        commenters = { ...commenters, ...getCommenters(items) }
        if (nextPageToken) {
          console.log(Object.keys(commenters).length, ' potential winners so far')
          getData(getApiUrl(videoId, nextPageToken))
        } else {
          console.log(Object.keys(commenters).length, ' potential winners: ', commenters)
          const result = getResult(commenters)
          if (!result) {
            document.getElementById('loading').innerHTML = 'Something went wrong..'
            return
          }
          console.log('A winrar is ', result.name, '! ', result.commentId)
          setResult(result, url)
        }
      })
  }

  getData(getApiUrl(videoId))
}

document.getElementById('button').addEventListener('click', getWinner)
