import axios from 'axios'

const apiClient = axios.create()
apiClient.cancelToken = axios.CancelToken
apiClient.isCancel = axios.isCancel
apiClient.defaults.headers.common['Content-Type'] = 'application/json'
apiClient.defaults.baseURL = process.env.API_URL
