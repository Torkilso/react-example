// @flow

"use strict";

import React from 'react';
import {render} from 'react-dom'
import {Router, Route, hashHistory} from 'react-router'

class Menu extends React.Component {
    render() {
        return <ul className="list-inline">
        <li><a href="/#/">Customers</a></li>
        <li><a href="/#/about">About</a></li>
        </ul>;
    }
}

class CustomerService {
    static instance = null;

    // Return singleton
    static get() {
        if (!this.instance)
            this.instance = new CustomerService();
        return this.instance;
    }

    constructor() {
    }

    getCustomers() {
      return fetch('/api/customers')
      .then((response) => response.json())
      .then((responseJson) => {
        return responseJson;
      })
      .catch((error) => {
        console.error(error);
      });
    }


    getCustomer(customerId) {

      return fetch('/api/customers/'+customerId)
      .then((response) => response.json())
      .then((responseJson) => {
        return responseJson;
      })
      .catch((error) => {
        console.error(error);
      });
    }

    addCustomer(name, city) {

        return fetch('api/add', {
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              },
          body: JSON.stringify({
              name: name,
              city: city
            })
          }).then((response) => {
            return response.json();
          }).catch((error) => {
            console.error(error);
          });
    }

    getIndex(id) {
        for (var i = 0; i < this.customers.length; i++) {
            if (this.customers[i].id === id) {
                return i;
            }
        }
        return -1; //to handle the case where the value doesn't exist
    }

    delCustomer(id){

      return fetch('/api/del/'+id,{method:'delete'})
        .then(
          function(response){
            if(response.status !== 200){
              return -1;
            }
            return 1;
          }
        )
    }

    updateCustomer(id, name, city) {
      return fetch('/api/upd/'+id, {
        method:'put',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            },
        body: JSON.stringify({
            name: name,
            city: city
          })
      })
      .then(
          function(response){
            if(response.status !== 200){
              return -1;
            }
            return 1;
          }
        )
    }
}

class CustomerListComponent extends React.Component {
    state = {status: "", customers: [], newCustomerName: "", newCustomerCity: "", deleteCustomerId: 0, alertClassName: "alert alert-success"}


    constructor() {
        super();

        CustomerService.get().getCustomers().then((result) => {
            this.setState({status: "Successfully loaded customer list", customers: result, alertClassName: "alert alert-success"});
        }).catch((reason) => {
            this.setState({status: "Error: " + reason, alertClassName: "alert alert-danger"});
        });
    }


    // Event methods, which are called in render(), are declared as properties:
    onNewCustomerFormChanged = (event) => {
        this.setState({[event.target.name]: event.target.value});
    }

    getIndex(id) {
        for (var i = 0; i < this.state.customers.length; i++) {
             if (this.state.customers[i].id == id) {
                return i;
            }
        }
        return -1; //to handle the case where the value doesn't existasd
    }

    // Event methods, which are called in render(), are declared as properties:
    onNewCustomer = (event) => {
        event.preventDefault();
        var name = this.state.newCustomerName;
        var city = this.state.newCustomerCity;
        CustomerService.get().addCustomer(name, city).then((result) => {
            this.state.customers.push({"id": result.id, "name": name, "city":city});
            this.setState({
                status: "Successfully added " + name + ":)",
                customers: this.state.customers,
                newCustomerName: "",
                newCustomerCity: "",
                alertClassName: "alert alert-success"
            });
        }).catch((reason) => {
            this.setState({status: "Error: " + reason, alertClassName: "alert alert-danger"});
        });
    }

    deleteCustomer = (event) => {

        event.preventDefault();
        var id = this.state.deleteCustomerId;

        CustomerService.get().delCustomer(id).then((result) => {
            var index = this.getIndex(id);

            if (index != -1) {
                this.state.customers.splice(index, 1);
                this.setState({
                    status: "Successfully deleted customer with id " + id,
                    customers: this.state.customers,
                    deleteCustomerId: "",
                    alertClassName: "alert alert-success"
                });

            } else {
              this.setState({
                status: "Customer with id " + id + " not found",
                customers:this.state.customers,
                deleteCustomerId: "",
                alertClassName: "alert alert-danger"
              });
            }
        }).catch((reason) => {
            this.setState({status: "Error: " + reason, alertClassName: "alert alert-danger"});
        });
    }

    render() {
        var listItems = this.state.customers.map((customer) =>
            <a href={"/#/customer/"+customer.id} className="list-group-item" key={customer.id}>{customer.name}</a>
        );
        return <div><div className={this.state.alertClassName}>{this.state.status}</div>
            <div className="list-group">{listItems}</div>
            <form onSubmit={this.onNewCustomer} onChange={this.onNewCustomerFormChanged}>
                <label>Name:<input type="text" name="newCustomerName" value={this.state.newCustomerName} className="form-control"/></label>
                <label>City:<input type="text" name="newCustomerCity" value={this.state.newCustomerCity}className="form-control"/></label>
                <input type="submit" value="New Customer" className="btn-success"/>
            </form>
            <form onSubmit={this.deleteCustomer} onChange={this.onNewCustomerFormChanged}>
                <label>Id:<input type="number" name="deleteCustomerId" value={this.state.deleteCustomerId} className="form-control"/></label>
                <input type="submit" value="Delete customer" className="btn-danger"/>
            </form>
        </div>
    }
}

class CustomerDetailsComponent extends React.Component {
    state = {status: "", customer: {}, updateName: "", updateCity: "", alertClassName: "alert alert-success"}

    constructor(props) {
        super(props);

        CustomerService.get().getCustomer(props.params.customerId).then((result) => {
            this.setState({status: "successfully loaded customer details", customer: result, alertClassName: "alert alert-success"});
        }).catch((reason) => {
            this.setState({status: "error: " + reason, alertClassName: "alert alert-danger"});
        });
    }

    updateCustomer = (event) => {
        event.preventDefault();

        var name = this.state.updateName;
        var city = this.state.updateCity;

        if (name === ""){
          name = this.state.customer.name;
        }
        if (city === "") {
          city = this.state.customer.city;
        }

        CustomerService.get().updateCustomer(this.state.customer.id, name, city).then((result) => {

            if(result = 1){
              this.setState({
                  status:"Customer updated",
                  customer:{id:this.state.customer.id, name:name, city:city},
                  updateName:"",
                  updateCity:"",
                  alertClassName: "alert alert-success"
              })
            } else {
              this.setState({
                  status:"Customer not updated",
                  updateName:"",
                  updateCity:"",
                  alertClassName: "alert alert-danger"
              })
            }

        }).catch((reason) => {
            this.setState({status: "Error: " + reason, alertClassName: "alert alert-danger"});
        });
    }

    onUpdateCustomerChanged = (event) => {
        this.setState({[event.target.name]: event.target.value});
    }

    render() {
        return <div><div className={this.state.alertClassName}>{this.state.status}</div>
            <ul className="list-group">
                <li className="list-group-item">Name: {this.state.customer.name}</li>
                <li className="list-group-item">City: {this.state.customer.city}</li>
            </ul>
            <form onSubmit={this.updateCustomer} onChange={this.onUpdateCustomerChanged}>
                <label>Name:<input type="text" name="updateName" value={this.state.updateName} className="form-control"/></label>
                <label>City:<input type="text" name="updateCity" value={this.state.updateCity} className="form-control"/></label>
                <input type="submit" value="Update customer" className="btn-info right"/>
            </form>
        </div>

    }
}

class AboutComponent extends React.Component {
    constructor(){
        super();
    }

    render(){
        return <div>
            <p>Applikasjon for å holde oversikt over kunder!</p>
            <p>Vi er studenter fra Trondheim </p>
        </div>
    }
}

class Routes extends React.Component {
    render() {
        return <Router history={hashHistory}>
            <Route exact path="/" component={CustomerListComponent}/>
            <Route path="/customer/:customerId" component={CustomerDetailsComponent}/>
            <Route path="/about" component={AboutComponent}/>
        </Router>;
    }
}

render(<div className="container">
    <Menu/>
    <div><Routes/></div>
</div>, document.getElementById('root'));
