import React from 'react'

const DateItem = ({ date }) => {
    return (
        <div className='axon-date-separator'>
            <div className='axon-date-separator-line'>

            </div>
            <div className='axon-date-separator-text'>
                {moment(date, frappe.defaultDatetimeFormat).format('Do MMMM YYYY')}
            </div>
            <div className='axon-date-separator-line'></div>
        </div>
    )
}

export default DateItem