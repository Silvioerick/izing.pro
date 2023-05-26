import axios from 'axios'

const service = axios.create({
  baseURL: 'https://auth2.izing.app/?rest_route=/izingpro/v1/auth',
  timeout: 20000
})

export function sessaolog () {
  const username = 'A1m9K4u'
  const password1 = 'NuAdkqNp5u8NrjtKusLNYPcWeVXMZERyGSPC'
  const encodedPassword = btoa(password1)
  return service({
    method: 'post',
    data: {
      username: username,
      password: encodedPassword
    }
  })
}
