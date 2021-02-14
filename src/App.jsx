//Author: Muhammad Aziz
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'

class SearchBar extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      error: false,
      isLoading: false,
      searchQuery: "",
      query: [],
      totalRequests: 0,
      //first cache that holds the query and character urls 
      //in the format ["search query", [character id's]]
      queryCache: [],
      //second cache that holds the character url and name,year, planet 
      //in the format ["character url", [name,year,planet]]
      characterCache: []
    }
    this.handleSearch = this.handleSearch.bind(this);
  }

  //this function handles whenever the search query changes
  handleSearch(event) {
    this.setState({
      searchQuery: event.target.value,
      isLoading: true
    })
    //this checks to see if the search query is in the first cache
    var foundInCache = false
    var characterIDs = null
    for (var i = 0; i < this.state.queryCache.length; i++) {
      if (event.target.value === this.state.queryCache[i][0]) {
        foundInCache = true
        characterIDs = this.state.queryCache[i][1]
        break
      }
    }
    //if the query was found in the cache, it extracts all Character ID's associated
    if (foundInCache) {
      var queries = []
      for (var i = 0; i < characterIDs.length; i++) {
        for (var j = 0; j < this.state.characterCache.length; j++) {
          if (characterIDs[i] === this.state.characterCache[j][0]) {
            console.log(this.state.characterCache[j][1])
            queries.push(this.state.characterCache[j][1])
          }
        }
      }
      this.setState({
        query: queries,
        isLoading: false
      })
    }

    //if the query was not in the cache then it commences api request
    else {
      fetch("https://swapi.dev/api/people/?search=" + event.target.value, { method: "GET" })
        .then(res => res.json())
        .then((result) => {
          //if the request yielded results
          if (result.results.length !== 0) {
            var queries = []
            var retrievedURLS = []
            var secondCache = this.state.characterCache
            var notFoundInSecondCache
            //this simaltaneously stashes the results in the second cache and 
            //add the results to the qeuries array which will be displayed
            for (var i = 0; i < result.results.length; i++) {
              retrievedURLS.push(result.results[i].url)
              queries.push([
                result.results[i].name,
                result.results[i].birth_year,
                result.results[i].homeworld
              ])
              //checks if the character already exists
              notFoundInSecondCache = true
              for (var j = 0; j < secondCache.length; j++) {
                console.log()
                if (result.results[i].url === secondCache[j][0]) {
                  notFoundInSecondCache = false
                }
              }
              //if it doesn't, then add to cache
              if (notFoundInSecondCache) {
                secondCache.push([
                  result.results[i].url,
                  [result.results[i].name, result.results[i].birth_year, result.results[i].homeworld]
                ])
              }
            }
            //this stores the character url results to a specific search query for first cache
            var newEntry = [event.target.value, retrievedURLS]
            var firstCache = this.state.queryCache
            firstCache.push(newEntry)

            this.setState({
              queryCache: firstCache,
              characterCache: secondCache,
              query: queries,
              isLoading: false,
              totalRequests: this.state.totalRequests + 1
            })
          }
          //if request yields no results, then keep old results displayed
          else {
            //adds a blank entry to cache
            var newEntry = [event.target.value, []]
            var firstCache = this.state.queryCache
            firstCache.push(newEntry)
            this.setState({
              queryCache: firstCache,
              isLoading: false,
              totalRequests: this.state.totalRequests + 1
            })
          }
        } //throws error is API can't be reached
          , (error) => {
            this.setState({
              isLoading: false,
              error: true
            });
          }
        )
    }
  }


  render() {

    const {
      error,
      isLoading,
      searchQuery,
      query,
      totalRequests,
      queryCache,
      characterCache
    } = this.state;

    return (
      <div className="col-xs-1 center-block text-center">
        <h1 className="fs-1">Welcome to the Star Wars Search</h1>
        <form className="container-lg" >
          <input
            id="search"
            type="text"
            placeholder="Luke Skywalker..."
            value={this.state.searchQuery}
            autoFocus
            onChange={this.handleSearch}
          />
        </form>
        <span className="badge rounded-pill bg-info text-light">({totalRequests} requests executed so far)</span>
        <hr />
        {this.state.isLoading ? <div className="alert alert-primary" role="alert">Loading...</div> : <div></div>}
        {this.state.error ? <div className="alert alert-danger" role="alert">Error, API can't be reached</div> : <div></div>}
        <div className="container-fluid">
          {this.state.query.map(item => (
            <>
              <div className="d-flex justify-content-center"> {item[0]} (born {item[1]}) </div>
              <hr />
            </>
          ))}
        </div>
      </div>
    );
  }
}

function App() {
  return (
    <div className="App">
      <SearchBar />
    </div>
  );
}

export default App;
