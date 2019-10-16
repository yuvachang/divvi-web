import React, { useState, useEffect } from 'react'
import { Dispatch, bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { ReduxState } from './store'
//import components
import TopHalf from './components/TopHalf/TopHalf'
import Modal from './components/Modal/Modal'
import { unixTimeToDate } from './components/functions'
//import actionCreators
import { useLocalStorageTotals } from './store/actions/totalsActions'
import BottomHalf from './components/BottomHalf/BottomHalf'
import { UserState } from './store/reducers/usersReducer'
import { TotalState } from './store/reducers/totalsReducer'
import { useLocalStorageUsers } from './store/actions/usersActions'

type Props = LinkDispatchProps & LinkStateProps

const App: React.FunctionComponent<Props> = props => {
  const [lsDate, setLsDate] = useState<string>('date not found')
  const [formHasData, setFormHasData] = useState<boolean>(false)
  const [displayModal, setModal] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [lsData, setLsData] = useState<string>('no data')

  const useLocalStorageData = (): void => {
    if (lsData !== 'no data') {
      const LS = JSON.parse(lsData)
      const newTotals: TotalState = LS.totals
      const newUsers: UserState = LS.users

      // Check integrity of LSDATA
      const totalsKeys = Object.keys(newTotals).length
      const ptotalsKeys = Object.keys(props.totals).length
      const initialsLength = newUsers.initials.length
      const usersLength = Object.keys(newUsers.users).length
      if (
        totalsKeys !== ptotalsKeys ||
        initialsLength !== usersLength
      ) {
        setError('Data corrupt')
        return
      } else {
        props.useLocalStorageTotals(newTotals)
        props.useLocalStorageUsers(newUsers)
        setFormHasData(true)
        closeModal()
      }
    }
  }

  const closeModal = () => {
    localStorage.removeItem('divviweb')
    setLsDate('date not found')
    setModal(false)
  }

  // onMount
  useEffect(() => {
    let LS: string | null = localStorage.getItem('divviweb')
    if (typeof LS === 'string') {
      setLsData(LS)

      let unixTime: number = JSON.parse(LS).date
      setLsDate(unixTimeToDate(unixTime))

      setModal(true)
    }
  }, [])

  //onUnmount
  window.onbeforeunload = () => {
    if (!!formHasData || !!Object.keys(props.users.users).length) {
      let unixTime = new Date().getTime()
      let saveData = {
        totals: { ...props.totals },
        users: { ...props.users },
        date: unixTime,
      }
      localStorage.setItem('divviweb', JSON.stringify(saveData))
    }
  }

  return (
    <div className='app'>
      {displayModal && (
        <Modal
          yes={useLocalStorageData}
          no={closeModal}
          msg={`Use unfinished session from ${lsDate}?`}
        />
      )}
      {error && <h1>{error}</h1>}
      <div className='app-card'>
        <div className='app-title'>Divvi</div>
        <TopHalf formHasData={formHasData} setFormHasData={(tf: boolean) => setFormHasData(tf)} />

        <BottomHalf />
      </div>
    </div>
  )
}

interface LinkDispatchProps {
  useLocalStorageTotals: (lsdata: TotalState) => void
  useLocalStorageUsers: (lsData: UserState) => void
}

interface LinkStateProps {
  totals: TotalState
  users: UserState
}

const mapState = (state: ReduxState, ownProps?: any) => ({
  totals: state.totals,
  users: state.users,
})

const mapDispatch = (dispatch: Dispatch, ownProps?: any): LinkDispatchProps => ({
  useLocalStorageTotals: bindActionCreators(useLocalStorageTotals, dispatch),
  useLocalStorageUsers: bindActionCreators(useLocalStorageUsers, dispatch),
})

export default connect(
  mapState,
  mapDispatch
)(App)
