import * as packageStore from 'package-store'
import test = require('tape')

test('public API', t => {
  t.equal(typeof packageStore.getRegistryName, 'function')
  t.equal(typeof packageStore.read, 'function')
  t.end()
})
