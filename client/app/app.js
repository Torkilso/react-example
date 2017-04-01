// @flow

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
    lastId = 0;

    customers = [];

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
        console.log(responseJson);
        return responseJson;
      })
      .catch((error) => {
        console.error(error);
      });
    }

    addCustomer(name, city) {
        return new Promise((resolve, reject) => {
            if (name && city) {
                this.customers.push({id: ++this.lastId, name: name, city: city});
                resolve(this.lastId);
                return;
            }
            reject("name or city empty");
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

    delCustomer(id) {
        return new Promise((resolve, reject) => {
            if (id) {
                var index = this.getIndex(id);
                this.customers.splice(index, 1);

                resolve(this.lastId);
                return;
            }
            reject("id not found");
        });
    }

    updateCustomer(id, name, city) {
        var index = this.getIndex(id);
        return new Promise((resolve, reject) => {
            if (name && city) {
                this.customers[index].name = name;
                this.customers[index].city = city;
                resolve(this.lastId);
                return;
            }
            reject("Could not update! Something went wrong :(");
        });
    }
}

class CustomerListComponent extends React.Component {
    state = {status: "", customers: [], newCustomerName: "", newCustomerCity: "", deleteCustomerId: 0}

    constructor() {
        super();

        CustomerService.get().getCustomers().then((result) => {
            this.setState({status: "successfully loaded customer list", customers: result});
        }).catch((reason) => {
            this.setState({status: "error: " + reason});
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
            this.state.customers.push({id: result, name: name, city});
            this.setState({
                status: "successfully added new customer",
                customers: this.state.customers,
                newCustomerName: "",
                newCustomerCity: ""
            });
        }).catch((reason) => {
            this.setState({status: "error: " + reason});
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
                    status: "successfully deleted customer",
                    customers: this.state.customers,
                    deleteCustomerId: ""
                });
            }
        }).catch((reason) => {
            this.setState({status: "error: " + reason});
        });
    }

    render() {
        var listItems = this.state.customers.map((customer) =>
            <a href={"/#/customer/"+customer.id} className="list-group-item" key={customer.id}>{customer.name}</a>
        );
        return <div>status: {this.state.status}<br/>
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
    state = {status: "", customer: {}, updateName: "", updateCity: ""}

    constructor(props) {
        super(props);

        CustomerService.get().getCustomer(props.params.customerId).then((result) => {
          console.log(result);
            this.setState({status: "successfully loaded customer details", customer: result});
        }).catch((reason) => {
            this.setState({status: "error: " + reason});
        });
    }

    updateCustomer = (event) => {
        event.preventDefault();

        var name = this.state.updateName;
        var city = this.state.updateCity;

        if (name === "") name = this.state.customer.name;
        if (city === "") city = this.state.customer.city;

        CustomerService.get().updateCustomer(this.state.customer.id, name, city).then((result) => {

            this.setState({
                status:"Customer updated",
                customer:{id:this.state.customer.id, name:name, city:city},
                updateName:"",
                updateCity:""
            })


        })
    }

    onUpdateCustomerChanged = (event) => {
        this.setState({[event.target.name]: event.target.value});
    }

    render() {
        return <div><div>status: {this.state.status}</div><br/>
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
