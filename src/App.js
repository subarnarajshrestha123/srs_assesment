import React, {Component} from 'react';
import './App.css';
import Results from './Results'
import SearchBar from './SearchBar'
import Pagination from './Pagination'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      input: '',
      gifs: [],
      lastQuery: '',
      perPage: 15,
      currentPage: 0,
      currentSection: 0,
      limit: 75,
      error: false,
      running: false,
      timeOut: null,
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.prev = this.prev.bind(this);
    this.next = this.next.bind(this);
    this.copyAlert = this.copyAlert.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.submitAfterTyping = this.submitAfterTyping.bind(this);
  }

// load 5 random gifs on page load
  componentDidMount() {
    this.getGifs('onLoad')
  }

  async getGifs(type) {
    // Dont try when API limit is reached
    if (this.state.error) return false;
    // Clear timeout if user presses enter before timeout finishes
    if (this.state.timeOut !== null) clearTimeout(this.state.timeOut)

  const api_key = '35BmFarU06WEWfGuLIANR490flFX8eRQ';

    // GET RANDOM GIFS ON LOAD
    if (type === 'onLoad') {
      let randomGifs = []
      for (let i = 0; i <= 4; i++) {
        let response = await fetch(`https://api.giphy.com/v1/gifs/random?api_key=${api_key}&tag=&rating=G`)
        let data = await response.json()
        if (data.meta.status === 200) {
            randomGifs.push({
              mp4: data.data.images.fixed_width.mp4,
              gifUrl: data.data.images.downsized.url
            })
          } else if (data.meta.status === 429) {
          let error = true;
          this.setState({
            ...this.state,
            gifs: [...randomGifs],
            error,
          })
        }
      }
      this.setState({
        ...this.state,
        gifs: [...randomGifs],
        running: true,
      })
    }

    if (type === 'query') {
      // Do nothing with blank input
      if (!this.state.input) return false;

      // Fetch 75 gifs to render
      let query = this.state.input;
      let offset = 0

      let response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${api_key}&q=${this.state.input}&limit=${this.state.limit}&offset=${offset}&rating=G&lang=en`)

      let data = await response.json()

      let gifUrls = [];

      if (data.meta.status === 200) {
        data.data.forEach(gif => {
          gifUrls.push({
            mp4: gif.images.fixed_width.mp4,
            gifUrl: gif.images.downsized.url
          })
        })

        this.setState({
          ...this.state,
          gifs: [...gifUrls],
          lastQuery: query,
          input: '',
          currentPage: 0,
          running: true,
        })

      } else if (data.meta.status === 429) {

        this.setState({
          ...this.state,
          gifs: [...this.state.gifs],
          lastQuery: query,
          input: '',
          currentPage: 0,
          error: true,
        })
      }
    }

    if (type === 'addToGifs') {
      console.log('Adding to Gifs')

      // Fetch 75 gifs to render
      let offset = (this.state.currentSection + 1) * this.state.limit;

      let response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${api_key}&q=${this.state.lastQuery}&limit=${this.state.limit}&offset=${offset}&rating=G&lang=en`)

      let data = await response.json()

      let gifUrls = [...this.state.gifs];

      if (data.meta.status === 200) {
        data.data.forEach(gif => {
          gifUrls.push({
            mp4: gif.images.fixed_width.mp4,
            gifUrl: gif.images.downsized.url
          })
        })

        this.setState({
          ...this.state,
          gifs: [...gifUrls],
          input: '',
          running: true,
        })

      } else if (data.meta.status === 429) {

        this.setState({
          ...this.state,
          gifs: [...this.state.gifs],
          input: '',
          error: true,
        })
      }
    }
  }

  handleSubmit() {
    this.getGifs('query')
    document.querySelector('.SearchBar-text').focus()
  }

  handleChange(e) {
    this.setState({
      ...this.state,
      input: e.target.value
    })
  }

  handleKeyUp() {
    let delay = 1000;
    if (this.state.timeOut !== null) clearTimeout(this.state.timeOut)
    let timeOut = setTimeout(this.submitAfterTyping, delay)
    this.setState({
      ...this.state,
      timeOut
    })
  }

  submitAfterTyping() {
    this.getGifs('query')
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.handleSubmit(e)
    }
  }

  prev(e) {
    if (this.state.currentPage === 0) return;
    else {
      // window.scrollTo(0,0)
      this.setState({
      ...this.state,
      currentPage: this.state.currentPage - 1
    })
    }
  }

  next(e) {
    if (((this.state.currentPage+1) * (this.state.perPage)) === this.state.gifs.length) {
      // Dont paginate when API limit is reached
      if (this.state.error) return false;
      this.getGifs('addToGifs')
      this.setState({
        ...this.state,
        currentSection: this.state.currentSection + 1,
        currentPage: this.state.currentPage + 1,
      })
    }
    else {
      this.setState({
      ...this.state,
      currentPage: this.state.currentPage + 1
    })
    }
  }

  copyAlert() {
    let copyAlert = document.querySelector('.App-alert')
    copyAlert.classList.add('show')
    setTimeout(()=>{
      copyAlert.classList.remove('show')
    },1000)
  }

  render() {

    let indexToSpliceFrom = this.state.currentPage * this.state.perPage
    let gifsToRender = Array.from(this.state.gifs).splice(indexToSpliceFrom, this.state.perPage)

    return (
      <div className="App">
        <div className="App-alert">
          <p className="App-alert-text">
            Link Copied To The Clipboard!
          </p>
        </div>
        <SearchBar
          onSubmit={this.handleSubmit}
          onKeyPress={this.handleKeyPress}
          onKeyUp={this.handleKeyUp}
          onChange={this.handleChange}
          input={this.state.input}
          lastQuery={this.state.lastQuery}
          hasError={this.state.error}
        />
        {this.state.gifs.length > 5 &&
          <Pagination
          next={this.next}
          prev={this.prev}
          perPage={this.state.perPage}
          currentPage={this.state.currentPage}
          currentSection={this.state.currentSection}
          gifAmt={this.state.gifs.length}
        />}
        <Results gifsToRender={gifsToRender} hasError={this.state.error} onClick={this.copyAlert}/>
        {this.state.gifs.length > 5 &&
          <Pagination
          next={this.next}
          prev={this.prev}
          perPage={this.state.perPage}
          currentPage={this.state.currentPage}
          currentSection={this.state.currentSection}
          gifAmt={this.state.gifs.length}
        />}
        <div className="App-attribution">
          <p>Designed by <a href='http://subarnatalks.blogspot.com/'>Subarna Shrestha</a> using ReactJS + the GIPHY API</p>
        </div>
      </div>
    );
  }
}

export default App;
