import './App.css';
import React, {Component} from 'react';
import RichTextEditor from 'react-rte';
var sanitizeHtml = require('sanitize-html');
require('dotenv').config();



class App extends Component {
  state = {
    apiPostResponse: "",
    dataReturned: null, 
    token: undefined,
    currentUser: undefined,
    displaySinglePost: null,
    createNewPost: false,
    post: [],
    skip: 0
  }

  componentDidMount(){
    this.callApi()

  }

  calculateSkip = async (skipAmount) => {
    let skip = this.state.skip += skipAmount;
    const totalPostResults = this.state.apiPostResponse.totalResults;
    
    //If last few posts shown
    if(skip >= totalPostResults) {
      //Display remaining results
      skip = this.state.skip -= skipAmount;
    }
    //Prevent error when clicking previous results on first result page
    else if(skip < 0) {
      skip = 0;
    }
    //Update skip value in state and refresh the post list
    await this.setState({skip: skip});
    console.log(totalPostResults, skip, "total post results, skip in calcSkip func");
    await this.callApi();
    
  }
  
  callApi = () => {
    // initialize data returned state to false:
    this.setState({dataReturned: false});
    console.log(JSON.stringify(this.state), "beforefetch state");

    fetch('/api/users/get_posts', {
      method: 'POST',
      headers: {
      'Content-type': 'application/json'
      }, 
      body: JSON.stringify(this.state),
    })
      .then(res => res.json())
      .then(res => {
        // update state with the returned data and set data returned flag to true
        this.setState({
          apiPostResponse: res,
          dataReturned: !this.state.dataReturned,
        })
        console.log(JSON.stringify(this.state), "afterfetch state")
        
      })
      .catch(err => console.log(err))
  }

  saveLoginResponseToAppState = (loginResponse) => {
    

    // this.setState({
    //   token: inputToken,
    //   userId: userId,
    //   currentUser: userName,
    //   loginResponse: loginResponse,
      
    // })
    this.setState({
      token: loginResponse.token,
      userId: loginResponse.userId,
      currentUser: loginResponse.userName,
      loginResponse: loginResponse,
    })
    console.log(loginResponse.token, loginResponse.userId, loginResponse.userName, loginResponse, " vars in update token comp")
    //console.log(this.state.loginResponse.errors, "errors in updateToken")
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
              ? <DisplayPostsComponent calculateSkip = {this.calculateSkip} displaySinglePost={this.showSinglePost} currentUserId={this.state.userId} updatePosts = {this.callApi} posts = {this.state.apiPostResponse} token ={this.state.token} />
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
            {this.state.displaySinglePost === true && this.state.createNewPost === false
              ? <ShowSinglePost token = {this.state.token} updatePosts = {this.callApi} userId = {this.state.userId} displaySinglePost={this.showSinglePost} post = {this.state.post} />
              : null
            }
            {this.state.createNewPost === true
              ? <CreatePostComponent createPost = {this.createNewPost} token = {this.state.token} uid = {this.state.userId} updatePosts = {this.callApi}/>
              : null
            }
          
          </div>
          
          <div className="login-reg-div" >
            
            {this.state.token === undefined && this.state.currentUser === undefined
              ? [<UserRegisterComponent key="reg1" />, <UserLoginComponent key="reg2" className="login-comp" updateToken = {this.saveLoginResponseToAppState}/>]
              : (this.state.loginResponse.errors === undefined
                  ? <LogoutUser isSuperUser = {this.state.loginResponse.isSuperUser} updateToken = {this.saveLoginResponseToAppState} name={this.state.currentUser}/>
                  : <RenderErrors errors = {this.state.loginResponse.errors} />
                )
            }
            {this.state.dataReturned === true && this.state.apiPostResponse.errors === undefined && this.state.createNewPost === false
              ? <button onClick = {this.createNewPost}>Create Post</button>
              : null
            }
             
            
          </div>
        
      </div>
     
    )
  }
}

class ShowSinglePost extends Component {
  state = {
    skip: 0,
    commentSkip: 0,
    renderDeleteComp:false,
  
  }

  componentDidMount() {
    this.callCommentApi();
   }
 

  calculateSkip = async (skipAmount) => {
    let skip = this.state.commentSkip += skipAmount;
    const totalPostResults = this.state.apiCommentResponse.totalResults;
    console.log(skipAmount, totalPostResults, "skipAmount, totalPostResults")
    //If last few posts shown
    if(skip >= totalPostResults) {
      //Display remaining results
      skip = this.state.commentSkip -= skipAmount;
    }
    //Prevent error when clicking previous results on first result page
    else if(skip < 0) {
      skip = 0;
    }
    //Update skip value in state and refresh the post list
    await this.setState({commentSkip: skip});
    console.log(totalPostResults, skip, "total post results, skip in calcSkip func");
    await this.callCommentApi();
    
  }

  //need to add current user to state here
  callCommentApi = () => {
    // initialize data returned state to false:
    this.setState({dataReturned: false});
    //Add props to new fetch obj
    let bodyObj = {
      token: this.props.token,
      postId: this.props.post._id,
      skip: this.state.commentSkip,
    }
    console.log(JSON.stringify(bodyObj), "beforefetch state");

    fetch('/api/users/get_comments', {
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
      <div className="post-body-div">
        <h2>{this.props.post.title}</h2>
        
          <p className="inputHTML" dangerouslySetInnerHTML={{__html: this.props.post.description}}></p>
        
        <ul>
          <li>Created on: {this.props.post.date}</li>
          <li>Posted by: {this.props.post.name}</li>
        </ul>
        <button onClick = {() => this.props.displaySinglePost(null)}> Close Post</button>
        <button onClick = {this.renderDeleteComp}> Delete Post </button> 
      </div>
      <CreateCommentComponent updateComments={this.callCommentApi} token = {this.props.token} postId = {this.props.post._id} userId = {this.props.userId} />
      <CommentListComponent calculateSkip = {this.calculateSkip} comments = {this.state.apiCommentResponse} updateComments={this.callCommentApi} token = {this.props.token} postId = {this.props.post._id}userId = {this.props.userId }/>   
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
          ? <DeletePostComp post = {this.props.post} token = {this.props.token} userId = {this.props.userId} updatePosts = {this.props.updatePosts} closeSinglePost = {this.props.displaySinglePost}/>
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
    description: RichTextEditor.createEmptyValue(),
    apiPostResponse: [],
  }
  //If handleSubmit was called by user clicking submit button in form
  handleSubmit = (event) => {
    //Prevent default action
    event.preventDefault();
    
    //remove sanctioned html tags from textbox input html
    let htmlifiedValue = sanitizeBodyHtml(this.state.description._cache.html);

    console.log(htmlifiedValue, "htmlified value in handlesubmit method")

    let bodyObj = {
      userId: this.props.userId,
      token: this.props.token,
      description: htmlifiedValue,
      postId: this.props.postId,
    }
      
    if(this.props.token === null || this.props.token === undefined) {
      this.setState({apiPostResponse: {errors: {error:"User not logged in"}}})
      return;
    }

    // initialize data returned state to false:
    this.setState({dataReturned: false})
    console.log(JSON.stringify(this.bodyObj), "beforefetch state")

    fetch('/api/users/create_comment', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      }, 
      body: JSON.stringify(bodyObj),
    })
      .then(res => res.json())
      .then(res => {
        console.log(res, "afterfetch state")
        
        // update state with the returned comment data
        this.setState({apiPostResponse: res, dataReturned: !this.state.dataReturned})
      })
      .then(() => this.props.updateComments())
      .then(() => {
        this.setState({
          description: RichTextEditor.createEmptyValue()
        }) //Reset textbox editor body field to empty.
      }) 
      .catch(err =>  console.log(err));
  }

 

  updateStateWithDescription = (value) => {
    // const target = event.target;
    // const value = target.value;
    // const name = target.name;
    
    //Update the input description value to html
    value.toString('html')
    
    this.setState({
      // [name]: value
      description: value,
    });
    
    
  }
  
  render () {
    
    return (
      <div className="comment-form-div" >
          
            
        
              <form onSubmit={this.handleSubmit}  method="post">
                <h3>Create Comment:</h3>
                <RichTextEditor
                  value={this.state.description}
                  onChange={this.updateStateWithDescription}
                  className="commentBox"
                  ref="richTextCompRef"
                  toolbarConfig={toolbarConfig}
                  
                />
               <input onSubmit={this.handleSubmit} className ="submit-input" type="submit" name="submitButton" value="Submit"/>
                {/* <textarea className="commentBox" id="inputBody" type="text" name="description" placeholder="What are your thoughts?"/> */}
              
              </form>
              
            
          
        
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
      
      
  
      fetch("/api/users/comment_count", {
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

  addCount = (commentId, count, uid) => {
    
    if(this.props.token == null) {
      this.setState({loginError: "Must be logged in to modify count."})
    }
    else {
      
      this.callCountApi(count, commentId, uid);
    }
    
  }

  renderDeleteComment = (comment, renderFlag) => {
    this.setState({
      deleteComment: renderFlag,
      comment: comment,
    })
  }
  //console.log(JSON.stringify(props.posts.latestPosts));
  
  renderCommentList = () => {
    
    let commentListArr = this.props.comments.latestComments;
    return commentListArr.map((item, index) => {
      
      return (
        <div className="single-comment-div" key={index}>
          <div className="comment-count-div">
            <button onClick={() => this.addCount(item._id, 1, this.props.userId)}>Upvote</button>
            <h3>Count: {item.count}</h3>
            <button onClick={() => this.addCount(item._id, -1, this.props.userId)}>Downvote</button>
          </div>
          <div className="comment-body-div">
            <ul>
              <p className="inputHTML" dangerouslySetInnerHTML={{__html: item.description}}></p>
              <div className="comment-timestamp-div">
                <li>Created on: {item.date}</li>
                <li>Created by: {item.name}</li>
                <li>Comment Id: {item._id}</li>
              </div>
              
            </ul>
            <div className = "delete-comment-button-div">
              <button onClick={() => this.renderDeleteComment(item, true)}>Delete Comment</button>
            </div>
          </div>
          
          
        </div>
      )
    })
  }

  
  render() {
    
    
    return (
    <div className="comments-comp">
      
      {this.state.loginError !== undefined
        ? <h3 className="render-error">{this.state.loginError}</h3>
        : null
      }
      {this.props.comments !== undefined && !this.deleteComment && this.props.comments.latestComments.length !== 0
          ? ([
              <div className="comment-list-div" key="comments1">
                <h2 id="comment-list-h2">Comments:</h2>,
                {this.renderCommentList()},
              </div>,
              <div className="comments-skip-div" key="comments2"> 
                <button onClick = {() => this.props.calculateSkip (-10)}>Previous Results</button>
                <button onClick = {() => this.props.calculateSkip (10)}>Next Results</button>
              </div>  
            ])
          : null
      }
      {this.state.deleteComment === true 
        ? <DeleteCommentComp updateComments = {this.props.updateComments} comment = {this.state.comment} renderDeleteComment = {this.renderDeleteComment} currentUserId = {this.props.userId} token = {this.props.token} />
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
      
      
  
      fetch("/api/users/add_count", {
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
            <button onClick={() => this.addCount(item._id, 1, this.props.currentUserId)}>Upvote</button>
            <h3>Count: {item.count}</h3>
            <button onClick={() => this.addCount(item._id, -1, this.props.currentUserId)}>Downvote</button>
          </div>
          <div className="single-list-div">
            <ul onClick={() => this.props.displaySinglePost(true, item)}>
              
              <h2>{item.title}</h2>
              <div className="post-timestamp-div"> 
                <li>Created on: {item.date}</li>
                <li>Created by: {item.name}</li>
                <li>Post Id: {item._id}</li>
              </div>
            </ul>
          </div>
        </div>
      )
    })
  }

  
  render() {
    
    return (
      <div className='posts-comp'>
      {this.state.loginError !== undefined
        ? <h3 className="render-error">{this.state.loginError}</h3>
        : ([
            <div className="post-list-div" key="posts1">{this.renderPostList()}</div>, 
            <div  className="posts-skip-div" key="posts2"> 
              <button onClick = {() => this.props.calculateSkip (-10)}>Previous Results</button>
              <button onClick = {() => this.props.calculateSkip (10)}>Next Results</button>
            </div>
          ])
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

    fetch('/api/users/register', {
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
      <div className="register-div">
        <form className="register-form" onSubmit={this.handleSubmit} onChange={this.handleChange} method="post">
            <h2>Register</h2>
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

    fetch('/api/users/login', {
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
        this.props.updateToken(this.state.apiLoginResponse)
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
      <div className="login-div">
        <form className="login-form" onSubmit={this.handleSubmit} onChange={this.handleChange} method="post">
            <h2>Login</h2>
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

class LogoutUser extends Component {

  logOut = () => {
    this.props.updateToken({errors: undefined})
  }
  render () {
    //console.log(this.props.isSuperUser, "superuser state in logout comp")
    return (
       
      <div className="logout-div">
        {this.props.isSuperUser === true && this.props.isSuperUser !== undefined
          ? <div>
              <h1> {this.props.name} (SuperUser)</h1>
              <button onClick = {this.logOut}>Logout</button>
            </div>
          : <div>
              <h1> {this.props.name}</h1>
              <button onClick = {this.logOut}>Logout</button>
            </div>
          
        }
      </div>

    )
  }    
 
}

class CreatePostComponent extends Component {
  
  state = {
    uid: this.props.uid,
    token: this.props.token,
    description: RichTextEditor.createEmptyValue(),
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
    
    
    //remove sanctioned html tags from textbox input html
    let htmlifiedValue = sanitizeBodyHtml(this.state.description._cache.html);
    //let dirtyHtmlifiedValue = html._cache.html;
    
    
  
    // initialize data returned state to false and update description with sanitized value
    console.log(htmlifiedValue, 'htmlified value in handleSubmit')
    this.setState({dataReturned: false});
    console.log(JSON.stringify(this.state), "beforefetch state")

    let bodyObj = {
      uid: this.state.uid,
      title: this.state.title,
      token: this.state.token,
      description: htmlifiedValue,

    }

   
    

    fetch('/api/users/create_post', {
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
      .then(() => this.props.updatePosts())
      .then(() => {
        this.setState({description: RichTextEditor.createEmptyValue()});  //reset the textbox body field to empty
      })
      .catch(err => console.log(err))
  }

  handleTitleChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
    
  }
  updateStateWithDescription = (value) => {
    // const target = event.target;
    // const value = target.value;
    // const name = target.name;
    
    //Update the input description value to html
    value.toString('html');
    
    this.setState({
      // [name]: value
      description: value,
    });
    
    
  }

  render() {
    return (
      // display register form or else success message and login form if registered
      <div className="post-form">
        <form  onSubmit={this.handleSubmit} method="post">
            
            <h3>Create Post:</h3>
            
            <input onChange={this.handleTitleChange} id="inputTitle" type="text" name="title" placeholder="Title"/>
            {/* <textarea id="inputBody" type="text" name="description" placeholder="Text"/> */}
            <RichTextEditor
                  value={this.state.description}
                  onChange={this.updateStateWithDescription}
                  className="commentBox"
                  ref="richTextCompRefPost"
                  toolbarConfig={toolbarConfig}
                  
            />
            <input className ="submit-input" type="submit" name="submitButton" value="Submit"/>
        </form>
        {this.state.dataReturned===true && this.state.apiPostResponse.errors === undefined
          ? <div>
              <h1>Post Created</h1>
              <ul>
              <li><strong>Post Title:</strong>  {this.state.apiPostResponse.title}</li>
                <li><strong>Post Description: {this.state.apiPostResponse.newPost.description}</strong></li>
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
  //If handleSubmit was called by user clicking submit button in form
  handleSubmit = (event) => {
    
    
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

    fetch('/api/users/delete_post', {
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
      </div>
    ) 
  }
}

class DeleteCommentComp extends Component {
  
  state = {
    dataReturned: false,
    apiPostResponse: [],
  }

  handleSubmit = (event) => {
    //If handleSubmit was called by user clicking submit button in form
    
      //Prevent default action
    event.preventDefault();

    if(this.props.token === null || this.props.token === undefined) {
      this.setState({apiPostResponse: {errors: {error:"User not logged in"}}})
      console.log(this.state.apiPostResponse.errors)
      return;
    }
  
    // initialize data returned state to false:
    this.setState({dataReturned: false})
    console.log(JSON.stringify(this.state), "beforefetch state")

    let bodyObj = {
      commentUserId: this.props.comment.uid,
      token: this.props.token,
      commentId: this.props.comment._id,
      currentUserId: this.props.currentUserId
    }

    fetch('/api/users/delete_comment', {
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
      <div className="delete-comment-div">
        <form className="delete-comment-form" onSubmit={this.handleSubmit} onChange={this.handleChange} method="post">
            <h3>Do you want to delete this comment?</h3>
            <input className ="submit-input" type="submit" name="submitButton" value="Delete"/>
        </form>
        <button onClick = {() => this.props.renderDeleteComment(null, false)}>Close Window</button>
        {this.state.dataReturned===true && this.state.apiPostResponse.errors === undefined
          ? <div>
              <h1>Post Deleted</h1>
              <ul>
              <li><strong>Comment Id:</strong>  {this.state.apiPostResponse.commentId}</li>
              <li><strong>Created By:</strong>  {this.state.apiPostResponse.name}</li>
              </ul> 
            </div>
          : null
        }
        
        {this.state.apiPostResponse.errors !== undefined
          ? <RenderErrors errors = {this.state.apiPostResponse.errors} />
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
      <h2 className="render-error">Errors with input:</h2>
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

// Helper Functions

//Sanitize the html input to allow only certain tags.  Content in between tags is left as is
const sanitizeBodyHtml = (html) => {
  
  let htmlifiedValue = sanitizeHtml(html, {
    allowedTags: [ 'h1', 'h2', 'h3','b','ul','ol','li','u', 'i', 'em', 'strong', 'a' ],
    allowedAttributes: {
      'a': [ 'href' ]
    },
  });

  return htmlifiedValue;

}

//richTextEditor toolbar config
const toolbarConfig = {
  // Optionally specify the groups to display (displayed in the order listed).
  display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'BLOCK_TYPE_DROPDOWN'],
  INLINE_STYLE_BUTTONS: [
    {label: 'Bold', style: 'BOLD', className: 'custom-css-class'},
    {label: 'Italic', style: 'ITALIC'},
    {label: 'Underline', style: 'UNDERLINE'}
  ],
  BLOCK_TYPE_DROPDOWN: [
    {label: 'Normal', style: 'unstyled'},
    {label: 'Heading Large', style: 'header-one'},
    {label: 'Heading Medium', style: 'header-two'},
    {label: 'Heading Small', style: 'header-three'}
  ],
  BLOCK_TYPE_BUTTONS: [
    {label: 'UL', style: 'unordered-list-item'},
    {label: 'OL', style: 'ordered-list-item'}
  ]
};


export default App;
