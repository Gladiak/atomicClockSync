import test from 'node:test';
import assert from 'node:assert/strict';
import { createBluetoothAttempt, finishBluetoothAttempt, normalizeBluetoothHistory, mergeSynchronizationHistory } from '../src/bluetooth-history.mjs';
const device = {name:'CASIO GST-B1000',model:'GST-B1000',module:'5748',address:'private-address'};

test('Bluetooth attempts preserve watch identity and machine outcomes without radio settings or GET assertions', () => {
  const entry=createBluetoothAttempt(device,1000);
  const done=finishBluetoothAttempt(entry,{ok:true,sent:true,reference:{host:'test.invalid',offsetMs:5,uncertaintyMs:20,synchronizedAt:3000}},4000,3.2);
  assert.equal(done.id,entry.id);
  assert.equal(done.type,'bluetooth');assert.equal(done.outcome,'sent');assert.equal(done.seconds,3);
  assert.deepEqual(done.watch,{name:'CASIO GST-B1000',model:'GST-B1000',module:'5748'});
  assert.equal(done.stationId,undefined);assert.equal(done.snapshot,undefined);assert.equal(done.reference.host,'test.invalid');
  assert.ok(!JSON.stringify(done).includes('private-address'));
});
test('Bluetooth failures, cancellation and uncertain writes retain distinct outcomes', () => {
  const entry=createBluetoothAttempt(device,1000);
  for(const [code,outcome] of [['protocol','failed'],['ntp','failed'],['cancelled','cancelled'],['uncertain','uncertain']]) {
    const done=finishBluetoothAttempt(entry,{ok:false,code},2000,1);
    assert.equal(done.outcome,outcome);assert.equal(done.code,code);assert.equal(done.reference,null);
  }
});
test('pending Bluetooth attempts survive restart as uncertain, without guessing success or retrying', () => {
  const entry=createBluetoothAttempt(device,1000);
  const restored=normalizeBluetoothHistory(JSON.parse(JSON.stringify([entry,entry,null,{type:'radio',at:1000}])));
  assert.equal(restored.length,1);assert.equal(restored[0].outcome,'uncertain');assert.equal(restored[0].code,'interrupted');
  assert.equal(restored[0].watch.model,'GST-B1000');
});
test('unified history is chronological and does not mutate the radio data used by Reception Lab', () => {
  const radio=[{id:'radio',at:2000,outcome:'get'}];
  const bluetooth=[finishBluetoothAttempt(createBluetoothAttempt(device,3000),{ok:true,sent:true},4000,1)];
  const before=structuredClone(radio);
  const merged=mergeSynchronizationHistory(radio,bluetooth);
  assert.equal(merged[0].type,'bluetooth');assert.equal(merged[1].id,'radio');
  assert.deepEqual(radio,before);
});
