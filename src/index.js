import getIdFromUrl from 'get-youtube-id'
import LOADING_MESSAGES from './loading-messages'
import './style.css'

const YOUTUBE_API_KEY = 'AIzaSyDc9FiNUYZ68YCCv90rdQiRjDtl_I4Y3l0'
const MAX_RESULTS = 100
const BASE_API_URL = `https://www.googleapis.com/youtube/v3/commentThreads?part=id%2Csnippet&maxResults=${MAX_RESULTS}&key=${YOUTUBE_API_KEY}`

// Reduce the comments array to an map of ids to
// display names by destructuring the comment objects
// This has the added bonus only letting each user
// appear once, since the id/key is overwritten if
// it occurs multiple times
const getCommenters = (comments = []) => comments.reduce((t, {
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

const getUrlFromInput = _ => document.getElementById('url').value

function setText (html = '', pre = '', post = '') {
  document.getElementById('pretext').innerHTML = pre
  document.getElementById('text').innerHTML = html
  document.getElementById('posttext').innerHTML = post
}

const getApiUrl = (videoId = '', pageToken) => pageToken
  ? `${BASE_API_URL}&videoId=${videoId}&pageToken=${pageToken}`
  : `${BASE_API_URL}&videoId=${videoId}`

function getRandom (obj = []) {
  const keys = Object.keys(obj)
  const rand = Math.floor(Math.random() * keys.length)
  const key = keys[rand]
  return obj[key]
}

function showRandomLoadingMessage () {
  setText('Loading', '', `${getRandom(LOADING_MESSAGES)}...`)
}

function getWinner () {
  const videoUrl = getUrlFromInput()
  const videoId = getIdFromUrl(videoUrl)

  if (!videoId) {
    setText('Invalid URL')
    return
  }

  let commenters = {}

  function getData (apiUrl) {
    showRandomLoadingMessage()
    window.fetch(apiUrl)
      .then(res => res.status === 200 && res.json())
      .then(json => {
        if (!json) {
          setText('Something went wrong..')
          return
        }
        const { nextPageToken, items } = json
        commenters = { ...commenters, ...getCommenters(items) }
        if (nextPageToken) {
          console.log(Object.keys(commenters).length, ' potential winners so far')
          getData(getApiUrl(videoId, nextPageToken))
        } else {
          console.log(Object.keys(commenters).length, ' potential winners: ', commenters)
          const { name = 'Someone', commentId } = getRandom(commenters) || {}
          if (!commentId) {
            setText('Something went wrong..')
            return
          }
          console.log('A winrar is ', name, '! ', commentId)
          setText(`<a class="link" href="${videoUrl}&lc=${commentId}">${name}</a>`, 'The winner is:', 'Congratulations!')
        }
      })
  }

  getData(getApiUrl(videoId))
}

document.getElementById('button').addEventListener('click', getWinner)
