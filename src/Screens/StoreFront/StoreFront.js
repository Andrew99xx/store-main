import React from 'react'
import AddCustomer from './AddCustomer'
import MakeBill from './MakeBill'
import CustomerInvoices from './CustomerInvoices'

const StoreFront = () => {
  return (
    <div>
      <MakeBill/>
      <AddCustomer/>
      <CustomerInvoices/>
    </div>
  )
}

export default StoreFront