import React from 'react'
import './SearchBar.css'

function SearchBar(props) {
  let placeholder;
  if (props.hasError) {
    placeholder = 'API Limit Reached!'
  } else {
    placeholder = props.lastQuery || 'Search GIPHY...'
  }
    return (
      <div className="SearchBar">
          <input className="SearchBar-text"
            onChange={props.onChange}
            type="text" value={props.input}
            placeholder={placeholder}
            onKeyPress={props.onKeyPress}
            onKeyUp={props.onKeyUp}>
          </input>
          <button className="SearchBar-submit" onClick={props.onSubmit}><i className="fas fa-search fa-2x SearchBar-icon"></i></button>
      </div>
    )
  }

export default SearchBar
