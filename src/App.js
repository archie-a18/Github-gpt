// import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';


import axios from 'axios';

const CLIENT_ID = "40c133e44f3a59324612";
const API_KEY = "2783cd19afmsha38d34836ed90d0p11e497jsn4794c0e5fa55"
const API_URL = 'https://text-keyword-extractor.p.rapidapi.com/keyword-extractor'

function App() {

  // const [accessToken, setAccessToken] = useState(null);
  const [rerender, setRerender] = useState(false);
  const [userData, setUserData] = useState({})
  const [repos, setRepos] = useState([]);
  // const [repoData, setRepoData] = useState([]);
  //const [prompt, setPrompt] = useState("");
  const [generateKeywords, setGenerateKeywords] = useState("");
  
  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const codeParam = urlParams.get("code");
   
    // console.log( `https://api.github.com/users/${userData.login}`);

    if (codeParam && (localStorage.getItem("accessToken") === null)) {
      async function getAccessToken() {
        await fetch("http://localhost:4000/getAccessToken?code=" + codeParam,
          {
            method: "GET"
          }).then((response) => {
            return response.json();
          }).then((data) => {
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

  // async function user(){
  //   const res=await axios.get( `https://api.github.com/users/${userData}`)
  //   console.log(await res.json());
  // }

  //GET USER DATA
  async function getUserData() {
    const res=await fetch("http://localhost:4000/getUserData", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("accessToken")
      }
    })
    const data=await res.json()
    setUserData(data)
  }

  // FUNCTION FOR REPOSITORIES

  async function getRepos() {
    await fetch( `https://api.github.com/users/${userData.login}/repos`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("accessToken")
      }
    }).then((response) => {
      return response.json();
    }).then((data) => {
      setRepos(data);
     
    })
  }

  // GET REPO DATA
  async function getRepoData(name, owner) {
    const response = await fetch("https://api.github.com/repos/" + owner + "/" + name + "/readme", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("accessToken")
      }
    });
    const data = await response.json();
    if (data.content) {
      const readmeContent = atob(data.content);
      console.log(readmeContent);

      // async function generateKeywords(readmeContent) {
      //   const config = {
      //     headers: {
      //       'x-rapidapi-host': 'text-monkey-keyword-extractor-v1.p.rapidapi.com',
      //       'x-rapidapi-key': API_KEY,
      //       'content-type': 'application/json',
      //       'accept': 'application/json'
      //     }
      //   }
      //   const data = {
      //     text: readmeContent
      //   } 
      //   const response = await axios.post(API_URL, data, config);
      //   return response.data.keywords;
      // }  

       function generateKeywords(readmeContent) {
        // Convert the text to lowercase and split it into an array of words
        const words =readmeContent.toLowerCase().split(/[^\w]+/);
      
        // Remove common words that don't add much meaning
        const commonWords = ["the", "and", "or", "a", "an", "in", "of", "to", "is", "was", "were", "are", "that", "this", "these", "those", "it", "not", "with", "for", "on", "at", "by", "from", "as", "but", "if", "out", "up", "about", "into", "when", "where", "which", "who", "whom", "why", "how"];
        const filteredWords = words.filter(word => !commonWords.includes(word));
      
        // Count the frequency of occurrence of each word
        const frequency = {};
        for (const word of filteredWords) {
          if (word in frequency) {
            frequency[word]++;
          } else {
            frequency[word] = 1;
          }
        }
      
        // Sort the words by their frequency of occurrence
        const sortedWords = Object.keys(frequency).sort((a, b) => frequency[b] - frequency[a]);
      
        // Return the top 5 most frequent words as keywords
        return sortedWords.slice(0, 10);
      }

      const keywords = generateKeywords(readmeContent);
      setGenerateKeywords(keywords.join(", "));
      console.log(keywords);
      return keywords;
    } }

  //LOGIN WITH GITHUB
  function loginWithGithub() {
    window.location.assign("https://github.com/login/oauth/authorize?client_id=" + CLIENT_ID);
  }

 
  return (
    <div className="App">
      <header className="App-header">
        {!localStorage.getItem("accessToken") ?
        <>
          <div>
            <h1 className="page_1">Welcome to ChatGpt Keyword Generator</h1>
            <h3>User is not logged in</h3>
            <button className="notlogged" onClick={loginWithGithub}>Login with Github</button>
          </div></>
          :
          <>
          <div>
            <h1>We have the access token</h1>
            <button onClick={getUserData}>Get Data</button>

            {Object.keys(userData).length !== 0 ?

              <div>
                <h1 className="page_2">Hey there, {userData.name}!</h1>
                <h3>Get Repositories from Github API</h3>
               
                <button onClick={() => { getRepos(); }}>Get Repositories</button>
                <>
                {repos.length !== 0 ?
                  <div>
                    <br />
                    <br />
                    <h3>List of Repositories:</h3>
                    <p>No of Public Repositories : {userData.public_repos}</p>
                    <br />
                    <ol>
                      <>
                      {
                      repos.map((repo, index) => (
                        <div className="repo_class">

                          <li key={index} className="list_item">
                           <strong> Repo ID</strong> = {repo.id} <strong> NAME</strong> = {repo.name}

                            <p><strong>Repo URL</strong> = <a href={repo.clone_url}>{repo.name}</a></p>

                            <button onClick={() => { getRepoData(repo.name, repo.owner.login) }}>
                              Summarize Readme</button>
                              

                            <br /> {generateKeywords !==0 &&
                        <div>
                          <h3>Generated Keywords</h3>
                          <p>{generateKeywords}</p>
                        </div>
                      }
                            
                          </li>

                        </div>
                      ))
                      }
                     </>
                    </ol>
                  </div>
                  :
                  null
                }</>
              </div>
              :
              null
            }
            <br />
            <br />
            <button onClick={() => { localStorage.removeItem("accessToken"); setRerender(!rerender); }}>Log out</button>
            <br />
          </div>
          </>
        }

      </header>
    </div>
  );

      }

export default App;
