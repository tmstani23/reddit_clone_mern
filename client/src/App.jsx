
import React, { Component } from 'react';
import './App.css';

class App extends Component {
  state = {
    apiResponse: ""
  }

  render () {
    return (
      <div className="App">
        <header>
          <h1> Welcome to React </h1>
        </header>
        <UserRegisterComponent/>
      </div>
    )
  }
}

//user register component
class UserRegisterComponent extends Component {
  state = {
    name: "",
    email: "",
    password: "",
    password2: "",
    dataReturned: null,
    apiLoginResponse: []
  }
  
  handleSubmit = (event) => {
    //If handleSubmit was called by user clicking submit button in form
    
      //Prevent default action
    event.preventDefault();
      
  
    // initialize data returned state to false:
    this.setState({dataReturned: false})
    console.log(JSON.stringify(this.state), "beforefetch state")

    fetch('http://localhost:4000/api/users/register', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      }, 
      body: JSON.stringify(this.state),
    })
      .then(res => res.json())
      .then(res => {
        console.log(res, "afterfetch state")
        
        // update state with the returned data and set data returned flag to true
        this.setState({apiLoginResponse: res, dataReturned: !this.state.dataReturned})
      })
      .catch(err => console.log(err))
  }

  handleChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
    
  }

  render() {
    return (
      // display register form or else success message and login form if registered
      <div className="register-form">
        <form onSubmit={this.handleSubmit} onChange={this.handleChange} method="post">
            <h3>Register Here</h3>
            <input id="inputName" type="text" name="name" placeholder="login name"/>
            <input id="inputEmail" type="text" name="email" placeholder="email"/>
            <input id="inputPass1" type="text" name="password" placeholder="password"/>
            <input id="inputPass2" type="text" name="password2" placeholder="enter password again"/>
            <input className ="submit-input" type="submit" name="submitButton" value="Submit"/>
          </form>
          
          <UserLoginComponent/>
          {this.state.dataReturned===true && this.state.apiLoginResponse.errors === undefined
            ? <div>
                <h1>Account Created</h1>
                <ul>
                  <li><strong>Name:</strong>  {this.state.apiLoginResponse.name}</li>
                  <li><strong>Email:</strong> {this.state.apiLoginResponse.email}</li>
                </ul> 
                
              </div>
            : null
          }
          {this.state.apiLoginResponse.errors !== undefined
            ? <RenderErrors errors = {this.state.apiLoginResponse.errors} />
            : null
          }
          {this.state.dataReturned === false
            ? <Loading />
            : null
          }
      </div>
    ) 
  }
}

class UserLoginComponent extends Component {
  state = {
    name: "",
    email: "",
    password: "",
    password2: "",
    dataReturned: null,
    apiLoginResponse: []
  }
  
  handleSubmit = (event) => {
    //If handleSubmit was called by user clicking submit button in form
    
      //Prevent default action
    event.preventDefault();
      
  
    // initialize data returned state to false:
    this.setState({dataReturned: false})
    console.log(JSON.stringify(this.state), "beforefetch state")

    fetch('http://localhost:4000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      }, 
      body: JSON.stringify(this.state),
    })
      .then(res => res.json())
      .then(res => {
        console.log(res, "afterfetch state")
        
        // update state with the returned data and set data returned flag to true
        this.setState({apiLoginResponse: res, dataReturned: !this.state.dataReturned})
      })
      .catch(err => console.log(err))
  }

  handleChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
    
  }

  render() {
    return (
      // display register form or else success message and login form if registered
      <div className="login-form">
        <form onSubmit={this.handleSubmit} onChange={this.handleChange} method="post">
            <h3>Login Here:</h3>
            <input id="inputName" type="text" name="name" placeholder="name"/>
            <input id="inputEmail" type="text" name="email" placeholder="email"/>
            <input id="inputPass1" type="text" name="password" placeholder="password"/>
            <input id="inputPass2" type="text" name="password2" placeholder="enter password again"/>
            <input className ="submit-input" type="submit" name="submitButton" value="Submit"/>
          </form>
          {this.state.dataReturned===true && this.state.apiLoginResponse.errors === undefined
            ? <div>
                <h1>User Logged In</h1>
                <ul>
                  <li><strong>Name:</strong>  {this.state.name}</li>
                  <li><strong>User Id:</strong>  {this.state.apiLoginResponse.userId}</li>
                  <li><strong>Token:</strong> {this.state.apiLoginResponse.token}</li>
                </ul> 
                <CreatePostComponent token = {this.state.apiLoginResponse.token} uid = {this.state.apiLoginResponse.userId} />
              </div>
            : null
          }
          {this.state.apiLoginResponse.errors !== undefined
            ? <RenderErrors errors = {this.state.apiLoginResponse.errors} />
            : null
          }
          {this.state.dataReturned === false
            ? <Loading />
            : null
          }
      </div>
    ) 
  }
}

class CreatePostComponent extends Component {
  
  state = {
    uid: this.props.uid,
    token: this.props.token,
    dataReturned: null,
    apiPostResponse: []
  }

  handleSubmit = (event) => {
    //If handleSubmit was called by user clicking submit button in form
    
      //Prevent default action
    event.preventDefault();
      
  
    // initialize data returned state to false:
    this.setState({dataReturned: false})
    console.log(JSON.stringify(this.state), "beforefetch state")

    fetch('http://localhost:4000/api/users/create_post', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      }, 
      body: JSON.stringify(this.state),
    })
      .then(res => res.json())
      .then(res => {
        console.log(res, "afterfetch state")
        
        // update state with the returned data and set data returned flag to true
        this.setState({apiPostResponse: res, dataReturned: !this.state.dataReturned})
      })
      .catch(err => console.log(err))
  }

  handleChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
    
  }

  render() {
    return (
      // display register form or else success message and login form if registered
      <div className="post-form">
        <form onSubmit={this.handleSubmit} onChange={this.handleChange} method="post">
            <h3>Create Post:</h3>
            <input id="inputTitle" type="text" name="title" placeholder="Title"/>
            <input id="inputBody" type="text" name="description" placeholder="Text"/>
            <input className ="submit-input" type="submit" name="submitButton" value="Submit"/>
          </form>
          {this.state.dataReturned===true && this.state.apiPostResponse.errors === undefined
            ? <div>
                <h1>Post Created</h1>
                <ul>
                <li><strong>Post Title:</strong>  {this.state.apiPostResponse.title}</li>
                  <li><strong>Post Description:</strong>  {this.state.apiPostResponse.newPost.description}</li>
                  <li><strong>Post Id:</strong>  {this.state.apiPostResponse.postId}</li>
                  <li><strong>Post Date:</strong>  {this.state.apiPostResponse.date}</li>
                  
                </ul> 
              </div>
            : null
          }
          {this.state.apiPostResponse.errors !== undefined
            ? <RenderErrors errors = {this.state.apiPostResponse.errors} />
            : null
          }
          {this.state.dataReturned === false
            ? <Loading />
            : null
          }
      </div>
    ) 
  }
}

function RenderErrors(props) {
  let errors = props.errors;
  let errorArr = [];
  //extract all error values into an array
  for (var property in errors) {
    errorArr.push(errors[property]);
  }

  //map each error to a list item
  const errorList = errorArr.map((item, index) => {
    return <ul key={index}>
      <li>{item}</li>
    </ul>
  })
  //return the error list with a heading as jsx
  return (
    <div>
      <h2>Errors with input:</h2>
      {errorList}
    </div>
  )
}

//Component to handle loading states when fetching data:
class Loading extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
      text: 'Loading'
      };
  }
  componentDidMount() {
      const stopper = this.state.text + '...';
      this.interval = window.setInterval(() => {
      this.state.text === stopper
          ? this.setState(() => ({ text: 'Loading' }))
          : this.setState((prevState) => ({ text: prevState.text + '.' }))
      }, 300)
  }
  componentWillUnmount() {
      window.clearInterval(this.interval);
  }
  render() {
      return (
      <p>
          {this.state.text}
      </p>
      )
  }
}


export default App;
