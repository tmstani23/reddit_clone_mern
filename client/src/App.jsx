
import React, { Component } from 'react';
import './App.css';

class App extends Component {
  state = {
    apiPostResponse: "",
    dataReturned: null, 
    token: undefined,
    currentUser: undefined,
    displaySinglePost: null,
    createNewPost: false,
    post: []
  }

  componentDidMount(){
    this.callApi()
  }
  
  callApi = () => {
    // initialize data returned state to false:
    this.setState({dataReturned: false});
    //console.log(JSON.stringify(this.state), "beforefetch state");

    fetch('http://localhost:4000/api/users/get_posts', {
      method: 'GET'
    })
      .then(res => res.json())
      .then(res => {
        // update state with the returned data and set data returned flag to true
        this.setState({apiPostResponse: res, dataReturned: !this.state.dataReturned})
        //console.log(JSON.stringify(this.state), "afterfetch state")
        
      })
      .catch(err => console.log(err))
  }

  updateToken = (inputToken, userId, userName, errors) => {
    
    this.setState({
      token: inputToken,
      userId: userId,
      currentUser: userName,
      currentUserErrors: errors,
    })
    console.log(inputToken, userId, userName, errors)
    console.log(this.state.currentUserErrors.errors, "errors in updateToken")
    //console.log(`token added in main state ${inputToken}, userId: ${userId}, username: ${userName}`)
  }

  showSinglePost = (state, post) => {
    
    this.setState({
      displaySinglePost: state,
      post: post
    })

    console.log(this.state.post)

  }
  createNewPost = async () => {
    let status = !this.state.createNewPost
    console.log(status)
    await this.setState({
      createNewPost: status
    })
  }

  render () {
    
    return (
      <div className="container">
        
          <div className="dynamic-comps">
            
          
            {this.state.dataReturned===true && this.state.apiPostResponse.errors === undefined && !this.state.displaySinglePost === true &&! this.state.createNewPost === true
              ? <DisplayPostsComponent displaySinglePost={this.showSinglePost} currentUserId={this.state.userId} updatePosts = {this.callApi} posts = {this.state.apiPostResponse} token ={this.state.token} />
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
            {this.state.displaySinglePost === true
              ? <ShowSinglePost token = {this.state.token} updatePosts = {this.callApi} userId = {this.state.userId} displaySinglePost={this.showSinglePost} post = {this.state.post} />
              : null
            }
            {this.state.createNewPost === true
              ? <CreatePostComponent createPost = {this.createNewPost} token = {this.state.token} uid = {this.state.userId} updatePosts = {this.callApi}/>
              : null
            }
          </div>
          <div className="login-div" >
            
            
            {this.state.dataReturned === true && this.state.apiPostResponse.errors === undefined && this.state.createNewPost === false
              ? <button onClick = {this.createNewPost}>Create Post</button>
              : null
            }
             
            {this.state.token === undefined && this.state.currentUser === undefined
              ? [<UserRegisterComponent key="reg1" className="register-comp"/>, <UserLoginComponent key="reg2" className="login-comp" updateToken = {this.updateToken}/>]
              : (this.state.currentUserErrors.errors === undefined
                  ? <UserIsLoggedInComponent updateToken = {this.updateToken} name={this.state.currentUser}/>
                  : <RenderErrors errors = {this.state.currentUserErrors.errors} />
                )
                  
                
            }
          </div>
           
      </div>
    )
  }
}

class ShowSinglePost extends Component {
  state = {
    renderDeleteComp:false,
    apiPostResponse: [],
  }

  //need to add current user to state here
  callCommentApi = () => {
    // initialize data returned state to false:
    this.setState({dataReturned: false});
    //Add props to new fetch obj
    let bodyObj = {
      token: this.props.token,
      postId: this.props.post._id,
    }
    console.log(JSON.stringify(bodyObj), "beforefetch state");

    fetch('http://localhost:4000/api/users/get_comments', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      }, 
      body: JSON.stringify(bodyObj),
    })
      .then(res => res.json())
      .then(res => {
        // update state with the returned data and set data returned flag to true
        this.setState({apiCommentResponse: res, dataReturned: !this.state.dataReturned})
        console.log(JSON.stringify(this.state), "afterfetch state")
        
      })
      .catch(err => console.log(err))
  }
  
  renderPost = () => {
    return (
    <div className="post-div">
      <h1>{this.props.post.title}</h1>
      <p>Body: {this.props.post.description}</p>
      <ul>
        <li>{this.props.post.date}</li>
        <li>Posted by: {this.props.post.name}</li>
      </ul>
      <button onClick = {() => this.props.displaySinglePost(null)}> Close </button>
      <button onClick = {this.renderDeleteComp}> Delete Post </button> 
      <CreateCommentComponent updateComments={this.callCommentApi} token = {this.props.token} postId = {this.props.post._id} userId = {this.props.userId} />
      <CommentListComponent comments = {this.state.apiCommentResponse} updateComments={this.callCommentApi} token = {this.props.token} postId = {this.props.post._id}userId = {this.props.userId }/>   
    </div>
    )
  }
  
  renderDeleteComp = () => {
    this.setState({
      renderDeleteComp: true
    })
  }

  

  render() {
  
    
    return (
      // display register form or else success message and login form if registered
      <div className="deletePosts-div">
      {this.state.renderDeleteComp === true 
        ? <DeletePostComp post = {this.props.post} token = {this.props.token} userId = {this.props.userId} updatePosts = {this.props.updatePosts}                  closeSinglePost = {this.props.displaySinglePost}/>
        : (this.props.post !== undefined
          ? (<div>{this.renderPost()}</div>)
          : null
          )
      }
      </div>
    ) 
  }

}

class CreateCommentComponent extends Component {
  state = {
    dataReturned: null,
    displayCommentForm: false,
    
    apiPostResponse: [],
  }

  // componentDidUpdate(prevProps) {
  //   // Typical usage (don't forget to compare props):
  //   if (this.props.token !== prevProps.token || this.props.userId !== prevProps.userId) {
  //     this.setState({
  //       token: this.props.token,
  //       userId: this.props.userId,
  //     })
      
  //   }
  // }
  //If handleSubmit was called by user clicking submit button in form
  handleSubmit = (event) => {
    
    let bodyObj = {
      userId: this.props.userId,
      token: this.props.token,
      description: this.state.description,
      postId: this.props.postId,
    }
      //Prevent default action
    event.preventDefault();

    if(this.props.token === null || this.props.token === undefined) {
      this.setState({apiPostResponse: {errors: {error:"User not logged in"}}})
      return;
    }
  
    // initialize data returned state to false:
    this.setState({dataReturned: false})
    console.log(JSON.stringify(this.state), "beforefetch state")

    fetch('http://localhost:4000/api/users/create_comment', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      }, 
      body: JSON.stringify(bodyObj),
    })
      .then(res => res.json())
      .then(res => {
        console.log(res, "afterfetch state")
        
        // update state with the returned data and set data returned flag to true
        this.setState({apiPostResponse: res, dataReturned: !this.state.dataReturned})
      })
      .then(() => this.props.updateComments())
      .catch(err =>  console.log(err));
  }

  showCommentForm = (inputState) => {
    this.setState({
      displayCommentForm: inputState
    })
  }

  handleChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
    
  }
  
  render () {
    return (
      <div>
        {this.state.displayCommentForm === false
          ? <button onClick = {() => this.showCommentForm(true)}>Create Comment</button>
          :  (
            <div>
              
              <form onSubmit={this.handleSubmit} onChange={this.handleChange} method="post">
              <h3>Create Comment:</h3>
              <textarea className="commentBox" id="inputBody" type="text" name="description" placeholder="What are your thoughts?"/>
              <input className ="submit-input" type="submit" name="submitButton" value="Submit"/>
              </form>
              <button onClick = {() => this.showCommentForm(false)}>Close Comment</button>
            </div>
          )
        }
        {this.state.apiPostResponse.errors !== undefined
            ? <RenderErrors errors = {this.state.apiPostResponse.errors} />
            : null
          }
        {this.state.dataReturned === false && this.state.apiPostResponse.errors === undefined
          ? <Loading />
          : null
        }
        
      </div>
      
    )
  }

}

class CommentListComponent extends Component {
  
  state = {
    apiPostResponse: [],
    postId: null,
    loginError: undefined,
    
  }
  componentDidMount() {
   this.props.updateComments();
  }

  

  callCountApi = async (count, commentId, uid) => {
    
      // initialize data returned state to false:
     await this.setState({
        dataReturned: false,
        count: count,
        commentId: commentId,
        userId: uid
      })
        
      console.log(JSON.stringify(this.state), "beforefetch state");
      
      
  
      fetch("http://localhost:4000/api/users/comment_count", {
        method: 'POST',
        headers: {
        'Content-type': 'application/json'
        }, 
        body: JSON.stringify(this.state),
      })
        .then(res => res.json())
        .then(res => {
          // update state with the returned data and set data returned flag to true
          this.setState({apiPostResponse: res, dataReturned: !this.state.dataReturned})
          console.log(JSON.stringify(this.state), "afterfetch state")
          
        })
        .then(() => this.props.updateComments())
        .catch(err => console.log(err))
    
  }

  // componentDidUpdate(prevProps) {
  //   // Typical usage (don't forget to compare props):
  //   if (this.props.token !== prevProps.token) {
  //     this.setState({
  //       loginError: undefined
  //     })
  //   }
  // }

  addCount = (commentId, count, uid) => {
    
    if(this.props.token == null) {
      this.setState({loginError: "Must be logged in to modify count."})
    }
    else {
      
      this.callCountApi(count, commentId, uid);
    }
    
  }
  //console.log(JSON.stringify(props.posts.latestPosts));
  
  renderCommentList = () => {
    
    let commentListArr = this.props.comments.latestComments;
    return commentListArr.map((item, index) => {
      return (
        <div className="single-post-div" key={index}>
          <div className="count-div">
            <button onClick={() => this.addCount(item._id, 1, this.props.userId)}>Add to Count</button>
            <h3>Count: {item.count}</h3>
            <button onClick={() => this.addCount(item._id, -1, this.props.userId)}>Subtract from Count</button>
          </div>
          <div className="single-post-div-div">
            <ul>
              <h2>Body: {item.description}</h2>
              <li>Date: {item.date}</li>
              <li>Created by: {item.name}</li>
              <li>Comment Id: {item._id}</li>
            </ul>
          </div>
          
          
          
        </div>
      )
    })
  }

  
  render() {
    
    
    return (
      <div className="posts-comp">
      <h1>Comment List:</h1>
      {this.state.loginError !== undefined
        ? <h3>{this.state.loginError}</h3>
        : null
      }
      {this.props.comments !== undefined
          ? (<div>{this.renderCommentList()}</div>)
          : null
      }
    </div>   
    )
  }
}

class DisplayPostsComponent extends Component {
  
  state = {
    apiPostResponse: "",
    dataReturned: null, 
    count: null,
    postId: null,
    token: this.props.token,
    
  }

  //need to add current user to state here

  callCountApi = async (count, postId, uid) => {
    
      // initialize data returned state to false:
     await this.setState({
        dataReturned: false,
        count: count,
        postId: postId,
        uid: uid
      })
        
      console.log(JSON.stringify(this.state), "beforefetch state");
      
      
  
      fetch("http://localhost:4000/api/users/add_count", {
        method: 'POST',
        headers: {
        'Content-type': 'application/json'
        }, 
        body: JSON.stringify(this.state),
      })
        .then(res => res.json())
        .then(res => {
          // update state with the returned data and set data returned flag to true
          this.setState({apiPostResponse: res, dataReturned: !this.state.dataReturned})
          console.log(JSON.stringify(this.state), "afterfetch state")
          
        })
        .then(() => this.props.updatePosts())
        .catch(err => console.log(err))
    
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.token !== prevProps.token) {
      this.setState({
        token: this.props.token,
        loginError: undefined
      })
    }
  }

  addCount = (postId, count, uid) => {
    
    if(this.props.token == null) {
      this.setState({loginError: "Must be logged in to modify count."})
    }
    else {
      
      this.callCountApi(count, postId, uid);
    }
    
  }
  //console.log(JSON.stringify(props.posts.latestPosts));
  
  renderPostList = () => {
    
    let postListArr = this.props.posts.latestPosts;
    return postListArr.map((item, index) => {
      return (
        <div className="single-post-div" key={index}>
          <div className="count-div">
            <button onClick={() => this.addCount(item._id, 1, this.props.currentUserId)}>Add to Count</button>
            <h3>Count: {item.count}</h3>
            <button onClick={() => this.addCount(item._id, -1, this.props.currentUserId)}>Subtract from Count</button>
          </div>
          <div className="single-post-div-div">
            <ul onClick={() => this.props.displaySinglePost(true, item)}>
              <h2>Title: {item.title}</h2>
              <li>Date: {item.date}</li>
              <li>Created by: {item.name}</li>
              <li>Post Id: {item._id}</li>
            </ul>
          </div>
          
          
          
        </div>
      )
    })
  }

  
  render() {
    
    
    return (
      <div className="posts-comp">
      <h1>Post List:</h1>
      {this.state.loginError !== undefined
        ? <h3>{this.state.loginError}</h3>
        : (
            <div>{this.renderPostList()}</div>
          )
      }
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
      <div >
        <form className="register-form" onSubmit={this.handleSubmit} onChange={this.handleChange} method="post">
            <h3>Register Here</h3>
            <input id="inputName" type="text" name="name" placeholder="login name"/>
            <input id="inputEmail" type="text" name="email" placeholder="email"/>
            <input id="inputPass1" type="text" name="password" placeholder="password"/>
            <input id="inputPass2" type="text" name="password2" placeholder="enter password again"/>
            <input className ="submit-input" type="submit" name="submitButton" value="Submit"/>
          </form>
          
          
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
      .then(() => {
        this.props.updateToken(this.state.apiLoginResponse.token, this.state.apiLoginResponse.userId, this.state.apiLoginResponse.userName, this.state.apiLoginResponse)
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
      <div >
        <form className="login-form" onSubmit={this.handleSubmit} onChange={this.handleChange} method="post">
            <h3>Login Here:</h3>
            <input id="inputName" type="text" name="name" placeholder="name"/>
            <input id="inputEmail" type="text" name="email" placeholder="email"/>
            <input id="inputPass1" type="text" name="password" placeholder="password"/>
            <input id="inputPass2" type="text" name="password2" placeholder="enter password again"/>
            <input className ="submit-input" type="submit" name="submitButton" value="Submit"/>
          </form>
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

class UserIsLoggedInComponent extends Component {

  logOut = () => {
    this.props.updateToken(undefined, null, undefined, {errors: undefined})
  }
  render() {
    return (
      <div>
        <h1>Username: {this.props.name}</h1>
        <button onClick = {this.logOut}>Logout</button>
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

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.token !== prevProps.token) {
      this.setState({
        token: this.props.token,
        uid: this.props.uid,
      })
    }
  }

  handleSubmit = (event) => {
    //If handleSubmit was called by user clicking submit button in form
    
      //Prevent default action
    event.preventDefault();

    if(this.state.token == null) {
      this.setState({apiPostResponse: {errors: {error:"User not logged in"}}})
      console.log(this.state.apiPostResponse.errors)
      return;
    }
  
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
      .then(() => this.props.updatePosts())
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
      <div>
        <form className="post-form" onSubmit={this.handleSubmit} onChange={this.handleChange} method="post">
            <h3>Create Post:</h3>
            <input id="inputTitle" type="text" name="title" placeholder="Title"/>
            <textarea id="inputBody" type="text" name="description" placeholder="Text"/>
            <input className ="submit-input" type="submit" name="submitButton" value="Submit"/>
        </form>
        {this.state.dataReturned===true && this.state.apiPostResponse.errors === undefined
          ? <div>
              <h1>Post Created</h1>
              <ul>
              <li><strong>Post Title:</strong>  {this.state.apiPostResponse.title}</li>
                <li><strong>Post Description:</strong>  {this.state.apiPostResponse.newPost.description}</li>
                <li><strong>Post Id:</strong>  {this.state.apiPostResponse.postId}</li>
                <li><strong>Post Date:</strong>  {this.state.apiPostResponse.postDate}</li>
                <li><strong>Created By:</strong>  {this.state.apiPostResponse.name}</li>
              </ul> 
            </div>
          : null
        }
        <button onClick = {this.props.createPost}>Close Window</button>
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

class DeletePostComp extends Component {
  
  state = {
    userId: this.props.userId,
    postUserId: this.props.post.uid,
    postId: this.props.post._id,
    token: this.props.token,
    dataReturned: null,
    apiPostResponse: [],
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.token !== prevProps.token) {
      this.setState({
        token: this.props.token,
        userId: this.props.userId,
        inputPost: this.props.post
      })
    }
  }

  handleSubmit = (event) => {
    //If handleSubmit was called by user clicking submit button in form
    
      //Prevent default action
    event.preventDefault();

    if(this.state.token === null || this.state.token === undefined) {
      this.setState({apiPostResponse: {errors: {error:"User not logged in"}}})
      console.log(this.state.apiPostResponse.errors)
      return;
    }
  
    // initialize data returned state to false:
    this.setState({dataReturned: false})
    console.log(JSON.stringify(this.state), "beforefetch state")

    fetch('http://localhost:4000/api/users/delete_post', {
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
      .then(() => this.props.updatePosts())
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
      <div>
        <form className="post-form" onSubmit={this.handleSubmit} onChange={this.handleChange} method="post">
            <h3>Do you want to delete this post?</h3>
            <input className ="submit-input" type="submit" name="submitButton" value="Delete"/>
        </form>
        <button onClick = {() => this.props.closeSinglePost(null)}>Close Window</button>
        {this.state.dataReturned===true && this.state.apiPostResponse.errors === undefined
          ? <div>
              <h1>Post Deleted</h1>
              <ul>
              <li><strong>Post Id:</strong>  {this.state.apiPostResponse.postId}</li>
              <li><strong>Created By:</strong>  {this.state.apiPostResponse.name}</li>
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
