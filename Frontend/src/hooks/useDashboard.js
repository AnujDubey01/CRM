import { useEffect, useState } from 'react'
import { getDashboardData } from '../services/dashboard.service'

export const useDashboard = () => {
  const [state, setState] = useState({
    data: null,
    error: '',
    loading: true,
    usingMockData: false,
  })

  const hydrateDashboard = async () => {
    try {
      const result = await getDashboardData()

      setState({
        data: result.data,
        error: '',
        loading: false,
        usingMockData: result.usingMockData,
      })
    } catch (error) {
      setState({
        data: null,
        error: error.message || 'Please check your connection and try again.',
        loading: false,
        usingMockData: false,
      })
    }
  }

  const retry = async () => {
    setState((previous) => ({
      ...previous,
      loading: true,
      error: '',
    }))

    await hydrateDashboard()
  }

  useEffect(() => {
    let isMounted = true

    const loadDashboard = async () => {
      try {
        const result = await getDashboardData()

        if (!isMounted) {
          return
        }

        setState({
          data: result.data,
          error: '',
          loading: false,
          usingMockData: result.usingMockData,
        })
      } catch (error) {
        if (!isMounted) {
          return
        }

        setState({
          data: null,
          error: error.message || 'Please check your connection and try again.',
          loading: false,
          usingMockData: false,
        })
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    ...state,
    retry,
  }
}
