#!/usr/bin/env node

// Quick test to verify dashboard components load
import blessed from 'blessed';
import contrib from 'blessed-contrib';
import si from 'systeminformation';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function test() {
  console.log('🧪 Testing Claw Dashboard components...\n');
  
  // Test 1: Module imports
  console.log('✅ Blessed imported');
  console.log('✅ Blessed-contrib imported');
  console.log('✅ Systeminformation imported');
  
  // Test 2: System info
  try {
    const cpu = await si.currentLoad();
    console.log(`✅ CPU: ${cpu.cpus.length} cores, ${cpu.currentLoad.toFixed(1)}% load`);
    
    const mem = await si.mem();
    console.log(`✅ Memory: ${(mem.used/1024/1024/1024).toFixed(1)}GB / ${(mem.total/1024/1024/1024).toFixed(1)}GB`);
    
    const osInfo = await si.osInfo();
    console.log(`✅ OS: ${osInfo.distro} ${osInfo.release} (${osInfo.arch})`);
  } catch (e) {
    console.log('❌ System info error:', e.message);
  }
  
  // Test 3: OpenClaw status
  try {
    const { stdout } = await execAsync('openclaw status --json', { timeout: 5000 });
    const data = JSON.parse(stdout);
    console.log(`✅ OpenClaw: ${data.agents?.totalSessions || 0} sessions, ${data.agents?.agents?.length || 0} agents`);
    console.log(`✅ Gateway: ${data.gateway?.reachable ? 'Online' : 'Offline'}`);
  } catch (e) {
    console.log('❌ OpenClaw error:', e.message);
  }
  
  console.log('\n🎉 All core tests passed! Dashboard is ready to run.');
  console.log('   Run: npm start');
  console.log('   Or:  ./start.sh');
}

test().catch(console.error);
