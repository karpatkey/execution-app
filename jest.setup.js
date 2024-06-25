// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

import fetch from 'fetch-vcr'

fetch.configure({
  fixturePath: './_fixtures',
  mode: 'record',
})
