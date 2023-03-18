
import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
//import Repositories from './Repositories';


import axios from 'axios';

const CLIENT_ID = "939d0384c31c7797ef48";

function App() {


  const [rerender, setRerender] = useState(false);
  const [userData, setUserData] = useState({})
  const [repos, setRepos] = useState([]);
  //forward the user to the github login screen(we pass in client id)
  //user is noe in github side and logs in (github.com)
  //when user decidesnto login .. they get forwareded back to localhost:3000
  //but localhost :3000/?asdf asdf asdf
  //use the code to get the access token

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const codeParam = urlParams.get("code");
    //console.log(codeParam);


    axios.get("https://api.github.com/users/archie-a18")
    .then((res)=>{setUserData(res.data)})

    if (codeParam && (localStorage.getItem("accessToken") === null)) {
      async function getAccessToken() {
        await fetch("http://localhost:4000/getAccessToken?code=" + codeParam, 
        {
          method: "GET"
        }).then((response) => 
        {
          return response.json();
        }).then((data) =>
         {
          console.log(data);
          if (data.access_token) {
            localStorage.setItem("accessToken", data.access_token);
            setRerender(!rerender);
          }
        })
      }
      getAccessToken();
    }

  }, [rerender]);

  async function getUserData() {
    await fetch("http://localhost:3000/getUserData", {
      method: "GET",
      headers: {
        "Authorization": "Bearer" + localStorage.getItem("accessToken")
      }
    }).then((response) => {
      return response.json();
    }).then((data) => {
      //console.log(data);

      setUserData(data);
    })
  }




// function for repositories

async function getRepos() {
  await fetch("https://api.github.com/users/"+userData.login+"/repos", {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("accessToken")
    }
  }).then((response) => {
    return response.json();
  }).then((data) => {
    setRepos(data);
    // window.open('/repos', '_blank');
  })
}


  function loginWithGithub() {
    window.location.assign("https://github.com/login/oauth/authorize?client_id=" + CLIENT_ID);
  }
  return (
    <div className="App">
      <header className="App-header">
      {!localStorage.getItem("accessToken") ?
        <div>
          <h3>User is not logged in</h3>
          <button onClick={loginWithGithub}>Login with Github</button>
        </div>
        :
        <div>
          <h1>We have the access token</h1>
          <button onClick={() => { localStorage.removeItem("accessToken"); setRerender(!rerender); }}>Log out</button>
          <br /><br />
          <h3>Get data from Github API</h3>
          {/* <button onClick={getUserData}>Get Data</button> */}
          <br /><br />
          {Object.keys(userData).length !== 0 ?
            <div>
              <h4>Hey there, {userData.name}!</h4>
              {/* <img src={userData.avatar_url} alt="" /> */}
              
              <br />
              <button onClick={getRepos}>Get Repositories</button>
              {repos.length !== 0 ?
                <div>
                  <h3>List of Repositories:</h3>
                  <ul>
                    {repos.map((repo, index) => (
                      <li key={index}>ID= { repo.id}      NAME= {repo.name}</li>
                    ))}
                  </ul>


                </div>
                :
                null
              }
            </div>
            :
            null
          }
        </div>
      }

      </header>
    </div>
  );

}

export default App;
