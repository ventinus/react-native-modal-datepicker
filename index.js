// @flow
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {
  TouchableOpacity,
  DatePickerIOS,
  DatePickerAndroid,
  Platform,
  Text,
  TimePickerAndroid,
  View,
  TouchableHighlight,
  Animated
} from 'react-native'
import {Actions} from 'react-native-router-flux'
import {Modal} from 'react-native-modal'

export default class ModalDatePicker extends Component {
  static propTypes = {
    date: PropTypes.oneOfType([
      PropTypes.instanceOf(Date),
      PropTypes.string,
    ]),
    mode: PropTypes.oneOf([
      'datetime',
      'date',
      'time',
    ]),
    minDate: PropTypes.instanceOf(Date),
    maxDate: PropTypes.instanceOf(Date),
    onChange: PropTypes.func,
    onDone: PropTypes.func,
    cancelText: PropTypes.string,
    doneText: PropTypes.string,
    middleText: PropTypes.string,
    showNowBtn: PropTypes.bool
  }

  static defaultProps = {
    onChange: () => {},
    date: new Date(),
    mode: 'datetime',
    cancelText: 'Cancel',
    doneText: 'Done',
    middleText: 'Now',
    showNowBtn: true
  }

  state = {
    date: this.props.date
  }

  constructor (props) {
    super(props)

    this.isIos = Platform.OS === 'ios'
    this.isAndroid = Platform.OS === 'android'
  }

  updateDate = (date) => {
    this.setState({date})
    this.props.onChange(date)
  }

  handleDone = (date) => {
    const doneDate = date || this.state.date
    this.props.onDone(doneDate)
    if (this.isAndroid) Actions.pop()
  }

  handleNow = () => this.handleDone(new Date())

  componentDidMount() {
    if (this.isAndroid) {
      this.displayAndroidPicker()
    }
  }

  displayAndroidPicker = () => {
    if (this.props.mode === 'date' || this.props.mode === 'datetime') {
      DatePickerAndroid.open({
        date: this.state.date,
        minDate: this.props.minDate,
        maxDate: this.props.maxDate
      })
      .then(({ action, year, month, day }) => {
        if (action !== DatePickerAndroid.dismissedAction) {
          if (this.props.mode === 'datetime') {
            TimePickerAndroid.open({
              hour: this.state.date.getHours(),
              minute: this.state.date.getMinutes(),
            })
            .then(({ action, hour, minute }) => {
              let finalDatetime = this.state.date
              if (action !== TimePickerAndroid.dismissedAction) {
                const dateWithHoursAndMinutes = new Date(
                  year, month, day, hour, minute
                )

                finalDatetime = new Date(Math.max(Date.now(), dateWithHoursAndMinutes.getTime()))
              }

              this.handleDone(finalDatetime)
            })
            .catch(({ code, message }) => console.info(`Cannot open date picker ${code}`, message))
          } else {
            const newDate = new Date(year, month, day)

            this.updateDate(newDate)
          }
        // else user canceled datepicker
        } else {
          this.handleDone()
        }
      })
      .catch(({ code, message }) => console.info(`Cannot open date picker ${code}`, message))
    } else if (this.props.mode === 'time') {
      TimePickerAndroid.open({
        hour: this.state.date.getHours(),
        minute: this.state.date.getMinutes(),
      })
      .then(({ action, hour, minute }) => {
        if (action !== TimePickerAndroid.dismissedAction) {
          const tempDate = new Date()

          tempDate.setHours(hour)
          tempDate.setMinutes(minute)
          tempDate.setSeconds(0)

          const finalTime = new Date(Math.max(Date.now(), tempDate.getTime()))

          this.handleDone(finalTime)
        }
      })
      .catch(({ code, message }) => console.info(`Cannot open date picker ${code}`, message))
    }
  }

  render () {
    if (this.isAndroid) return <View />

    return (
      <Modal
        onDone={this.handleDone}
        onMiddlePress={this.handleNow}
        middleText={this.props.showNowBtn ? this.props.middleText : null}
      >
        <DatePickerIOS
          date={this.state.date}
          minimumDate={this.props.minDate}
          maximumDate={this.props.maxDate}
          mode={this.props.mode}
          onDateChange={this.updateDate}
        />
      </Modal>
    )
  }
}
