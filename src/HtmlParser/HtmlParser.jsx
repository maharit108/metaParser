import React, { Component } from 'react'

class HtmlParser extends Component {
  constructor() {
    super()
    this.state = {
      htmlStr: '',
      metaObjArr: [],
      errMsg: ''
    }
  }
  
  getMetaContents = (el) => {
    if (el.children.length === 0) {
      let metaObj = {}
      let key = ''

      // for EPUB2 when metadata uses meta tag's name and content attributes
      if (el.getAttribute('name')) {
        key = el.getAttribute('name')
        if (key.includes('a11y:')) {
          metaObj[key.replace('a11y:', '')] = el.getAttribute('content')
          this.setState(prevState => ({ metaObjArr: [...prevState.metaObjArr, metaObj]}))
        }
      }

      // for EPUB3 when metadata uses link and meta tags with property, rel and href attributes
      if (el.getAttribute('property') || el.getAttribute('rel')) {
        key = el.getAttribute('property') || el.getAttribute('rel')
        if(key.includes('a11y:')) {
          if (el.getAttribute('rel')) {
            metaObj[key.replace('a11y:', '')] = el.getAttribute('href')
          } else {
            metaObj[key.replace('a11y:', '')] = el.nextSibling.textContent
          }
          this.setState(prevState => ({ metaObjArr: [...prevState.metaObjArr, metaObj]}))
        }
      }
      return
    }

    // recursive check all nodes of given element
    for (let i=0; i < el.children.length; i++) {
      this.getMetaContents(el.children[i])
    }
  }

  /*
  // create a dummy element and add HTML string to it to use browser to validate if the string is valid HTML or not
  // if valid, use DOM methods to get the required data
  */
  onParse = () => {
    this.setState(prevState => (prevState.metaObjArr.length && {metaObjArr: [], errMsg: ''}))
    let el = document.createElement('div');
    el.innerHTML = this.state.htmlStr
    if (Boolean(this.state.htmlStr) && Boolean(el.children.length)) {
      this.getMetaContents(el.children[0])
    }
    this.setState({errMsg: 'Please provide valid HTML'})

  }

  render () {
    return (  
      <div className="main_Wrapper">
        <label htmlFor="input_htmlStr">HTML for parsing</label>
        <textarea id="input_htmlStr" name="input_htmlStr" rows="4" cols="50" value={this.state.htmlStr} onChange={(e) => this.setState({htmlStr: e.target.value})}></textarea>
        {this.state.errMsg && (<p>{this.state.errMsg}</p>)}
        <button onClick={this.onParse}>Parse HTML</button>
          <div>
            {this.state.metaObjArr.map((metaObj, idx) => (
              <div key={idx}>
                <span>{Object.keys(metaObj)}</span>
                <span>{metaObj[Object.keys(metaObj)]}</span>
              </div>
            ))}
          </div>
      </div>
    )
  }
}

export default HtmlParser
