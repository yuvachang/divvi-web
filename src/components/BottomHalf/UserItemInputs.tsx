import React, { useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
//nonpackage imports
import { ReduxState } from '../../store'
import { UserObject } from '../../store/reducers/usersReducer'
import {
  updateUserName,
  updateUserPaid,
  updateUserOweAmount,
  toggleIsCustomOweAmt,
  calcOweAmounts,
} from '../../store/actions/usersActions'
import { roundUSD, capitalizeWords } from '../functions'

interface OwnProps {
  user: UserObject
}

type Props = LinkDispatchProps & LinkStateProps & OwnProps

const UserItemInputs: React.FunctionComponent<Props> = props => {
  const [user, setUser] = useState<UserObject>({ ...props.user })

  const updateStore = (targetName: string, value: string): string => {
    switch (targetName) {
      case 'name': {
        value = capitalizeWords(value)
        props.updateName(value, user.uid)
        break
      }
      case 'paid': {
        props.updatePaid(String(roundUSD(+value)), user.uid)
        value = roundUSD(+value).toFixed(2)
        break
      }
      case 'oweAmount': {
        props.updateUserOweAmt(String(roundUSD(+value)), user.uid, props.total)
        value = roundUSD(+value).toFixed(2)
        break
      }
    }

    if (+value === 0) {
      if (targetName === 'name') {
        return ''
      } else {
        return '0'
      }
    } else return value
  }

  const handleChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    let target = e.target as HTMLInputElement
    let value: string = target.value

    setUser({
      ...user,
      [target.name]: value,
    })
  }

  const formatOnBlur = (e: React.SyntheticEvent<HTMLInputElement>) => {
    let target = e.target as HTMLInputElement
    let value: string = target.value

    value = updateStore(target.name, value)

    setUser({
      ...user,
      [target.name]: value,
    })
  }

  const enterKeyListener = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement
    const key = e.which || e.keyCode
    if (target.name === 'name') {
      if ((key >= 37 && key <= 40) || (key >= 48 && key <= 57)) {
        e.preventDefault()
        return
      }
    }

    if (e.keyCode === 190 || e.keyCode === 110) {
      if (target.value.includes('.')) {
        // If number already has decimal, do nothing
        e.preventDefault()
        return
      }
    }
    if (e.keyCode === 13) {
      target.blur()
    }
  }

  const oweButtonHandler = () => {
    const bool = !user.isCustomOweAmt
    props.toggleCustOweAmt(bool, props.user.uid)
    props.calcOweAmounts(props.total)

    setUser({
      ...user,
      isCustomOweAmt: bool,
      oweAmount: props.user.oweAmount,
    })
  }

  return (
    <div className='user-item-inputs'>
      <div className='segment'>
        <div className='title greytext'>Name:</div>
        <input
          className='bottom'
          type='text'
          name='name'
          value={user.name || ''}
          onChange={handleChange}
          onBlur={formatOnBlur}
          onKeyDown={enterKeyListener}
          spellCheck={false}
        />
      </div>
      <div className='segment'>
        <div className='title greytext'>Paid:</div>
        <div className='symbol greytext'>$</div>
        <input
          className='bottom'
          type='number'
          name='paid'
          value={user.paid || 0}
          onChange={handleChange}
          onBlur={formatOnBlur}
          onKeyDown={enterKeyListener}
        />
      </div>

      <div className='segment'>
        <div className='title greytext'>Owes:</div>
        <div className='symbol greytext'>$</div>
        <input
          className={`bottom ${user.isCustomOweAmt ? '' : 'no-hover'}`}
          type='number'
          name='oweAmount'
          value={user.isCustomOweAmt ? user.oweAmount : props.user.oweAmount || 0}
          onChange={handleChange}
          onBlur={formatOnBlur}
          onKeyDown={enterKeyListener}
          disabled={!user.isCustomOweAmt}
        />
        <div className='button'>
          <img
            alt='edit/clear'
            src={!!user.isCustomOweAmt ? '/icons/remove.svg' : '/icons/edit.svg'}
            className='arrowicon'
            onClick={oweButtonHandler}
          />
        </div>
      </div>
    </div>
  )
}

interface LinkStateProps {
  total: number
}

interface LinkDispatchProps {
  updateName: (name: string, uid: string) => void
  updatePaid: (paid: string, uid: string) => void
  updateUserOweAmt: (oweAmount: string, uid: string, total: number) => void
  toggleCustOweAmt: (isCustomOweAmt: boolean, uid: string) => void
  calcOweAmounts: (total: number) => void
}

const mapState = (state: ReduxState, ownProps?: any) => ({
  total: state.totals.total,
})

const mapDispatch = (dispatch: Dispatch, ownProps?: any): LinkDispatchProps => ({
  updateName: bindActionCreators(updateUserName, dispatch),
  updatePaid: bindActionCreators(updateUserPaid, dispatch),
  updateUserOweAmt: bindActionCreators(updateUserOweAmount, dispatch),
  toggleCustOweAmt: bindActionCreators(toggleIsCustomOweAmt, dispatch),
  calcOweAmounts: bindActionCreators(calcOweAmounts, dispatch),
})

export default connect(
  mapState,
  mapDispatch
)(UserItemInputs)
