import React, { Component } from 'react'
import { TextField, Button, Divider, Paper, Table, TableContainer, TableCell, TableBody, TableHead, TableRow } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SortIcon from '@mui/icons-material/Sort';

import './HtmlParser.css'


class HtmlParser extends Component {
  constructor() {
    super()
    this.state = {
      htmlStr: '',
      metaObjArr: [],
      errMsg: '',
      nameisAscending: false,
    }
  }
  
  getMetaContents = (el) => {
    if (el.children.length === 0) {
      let metaObj = {}
      let name = ''

      // for EPUB2 when metadata uses meta tag's name and content attributes
      if (el.getAttribute('name')) {
        name = el.getAttribute('name')
        if (name.includes('a11y:')) {
          metaObj = {
            name: name.replace('a11y:', ''),
            content: el.getAttribute('content')
          }
          this.setState(prevState => ({ metaObjArr: [...prevState.metaObjArr, metaObj]}))
        }
      }

      // for EPUB3 when metadata uses link and meta tags with property, rel and href attributes
      if (el.getAttribute('property') || el.getAttribute('rel')) {
        name = el.getAttribute('property') || el.getAttribute('rel')
        if(name.includes('a11y:')) {
          if (el.getAttribute('rel')) {
            metaObj = {
              name: name.replace('a11y:', ''),
              content: el.getAttribute('href')
            }
          } else {
            metaObj = {
              name: name.replace('a11y:', ''),
              content: el.nextSibling.textContent
            }
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
    this.setState(prevState => (prevState.metaObjArr.length && {metaObjArr: []}))
    let el = document.createElement('div');
    el.innerHTML = this.state.htmlStr
    if (Boolean(this.state.htmlStr) && Boolean(el.children.length)) {
      this.setState({errMsg:''})
      this.getMetaContents(el)
    } else {
      this.setState({errMsg: 'Please provide valid HTML', htmlStr: ''})
    }
  }

  sortFunc = (arr, sortBy, sortType) => {
    arr.sort(function(item1, item2) {
      var checkItem1 = item1[sortBy].toUpperCase(); // ignore upper and lowercase
      var checkItem2 = item2[sortBy].toUpperCase(); // ignore upper and lowercase
      if (checkItem1 < checkItem2) {
        return sortType ? -1 : 1;
      }
      if (checkItem1 > checkItem2) {
        return sortType ? 1 : -1;
      }
      // names must be equal
      return 0;
    });
    this.setState({ 
      metaObjArr: arr, 
      nameisAscending: sortBy === 'name' ? !this.state.nameisAscending : this.state.nameisAscending, 
     })
  }

  render () {
    return (  
      <div className="main_Wrapper">
        <div className="left_inputSection">
          <TextField
            label="HTML Metadata"
            multiline
            rows={10}
            variant="outlined"
            sx={{ width: '80%', maxWidth: '450px', minWidth: '280px'}}
            value={this.state.htmlStr} 
            onChange={(e) => this.setState({htmlStr: e.target.value})}
          />
          {this.state.errMsg && (<p className="errTxt">{this.state.errMsg}</p>)}
          <Button sx={{ width: '80%', maxWidth: '450px', minWidth: '280px', margin: '20px auto'}}
                  variant="contained" 
                  onClick={this.onParse}>
            Parse HTML
          </Button>
        </div>

        <Divider orientation="vertical" variant="middle" flexItem />
        
        <div className="right_displaySection">
          <Paper sx={{width: '80%', minWidth: '350px', maxWidth: '600px' }}>
            <TableContainer>
              <Table sx={{ width: '80%', minWidth: '350px', maxWidth: '600px' }} aria-label="Accessibility Meta Name and Contents">
                <TableHead>
                  <TableRow>
                    <TableCell onClick={() => this.sortFunc(this.state.metaObjArr, 'name', this.state.nameisAscending)}><SortIcon />Name</TableCell>
                    <TableCell >Content</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.metaObjArr.map((metaObj, idx) => (
                    <TableRow
                      key={idx}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align="left">{metaObj.name}</TableCell>
                      <TableCell align="left">{metaObj.content}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>
        
      </div>
    )
  }
}

export default HtmlParser
