// Test automation script for Properties Panel getComputedStyle functionality
// This script validates the fix implemented in commit cdccda9

const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function testPropertiesPanel() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    const results = {
        timestamp: new Date().toISOString(),
        commit: 'cdccda9',
        tests: []
    };

    try {
        // Navigate to editor
        console.log('🌐 Navigating to vanilla editor...');
        await page.goto('http://localhost:3030', { waitUntil: 'networkidle2' });

        // Wait for editor to load
        await page.waitForSelector('#canvas', { timeout: 10000 });
        console.log('✅ Editor loaded successfully');

        // Test 1: Create element with inline styles
        console.log('\n🧪 Test 1: Creating element with inline styles...');
        await page.evaluate(() => {
            const canvas = document.getElementById('canvas');
            const element = document.createElement('div');
            element.className = 'canvas-element test-element-1';
            element.textContent = 'Test Element 1';
            element.style.padding = '20px';
            element.style.backgroundColor = 'rgb(255, 0, 0)';
            element.style.fontSize = '24px';
            canvas.appendChild(element);
        });

        // Click on the element to select it
        await page.click('.test-element-1');
        await page.waitForTimeout(500);

        // Capture console logs for debug info
        const logs1 = await page.evaluate(() => {
            const logs = [];
            const originalLog = console.log;
            console.log = (...args) => {
                logs.push(args.join(' '));
                originalLog.apply(console, args);
            };
            // Trigger loadProperties
            if (window.selectedElement) {
                window.loadProperties(window.selectedElement);
            }
            return logs;
        });

        // Check properties panel values
        const test1Results = await page.evaluate(() => {
            const getInputValue = (selector) => {
                const input = document.querySelector(selector);
                return input ? input.value : null;
            };

            return {
                padding: {
                    top: getInputValue('input[placeholder="Top"][onchange*="paddingTop"]'),
                    right: getInputValue('input[placeholder="Right"][onchange*="paddingRight"]'),
                    bottom: getInputValue('input[placeholder="Bottom"][onchange*="paddingBottom"]'),
                    left: getInputValue('input[placeholder="Left"][onchange*="paddingLeft"]')
                },
                fontSize: getInputValue('input[onchange*="fontSize"]'),
                backgroundColor: getInputValue('input[type="color"][onchange*="backgroundColor"]')
            };
        });

        results.tests.push({
            name: 'Inline Styles Reading',
            passed: test1Results.padding.top === '20' &&
                   test1Results.fontSize === '24px' &&
                   test1Results.backgroundColor === '#ff0000',
            details: test1Results,
            logs: logs1
        });

        // Test 2: Load a template
        console.log('\n🧪 Test 2: Loading template with external styles...');
        await page.evaluate(() => {
            const canvas = document.getElementById('canvas');
            canvas.innerHTML = `
                <section class="canvas-element" style="padding: 80px 20px; background-color: #f7fafc;">
                    <h2 class="canvas-element" style="font-size: 56px; font-weight: bold; color: #1a202c;">
                        Template Heading
                    </h2>
                    <p class="canvas-element" style="font-size: 18px; color: #4a5568; margin-top: 20px;">
                        Template paragraph with computed styles
                    </p>
                </section>
            `;
        });

        // Click on the h2 element
        await page.click('h2.canvas-element');
        await page.waitForTimeout(500);

        // Capture debug logs
        const logs2 = await page.evaluate(() => {
            const logs = [];
            // Get the console output
            if (window.selectedElement) {
                const tagName = window.selectedElement.tagName.toLowerCase();
                const computedStyle = window.getComputedStyle(window.selectedElement);
                logs.push(`Selected: ${tagName}`);
                logs.push(`Font Size from getComputedStyle: ${computedStyle.fontSize}`);
                logs.push(`Font Weight from getComputedStyle: ${computedStyle.fontWeight}`);
                window.loadProperties(window.selectedElement);
            }
            return logs;
        });

        // Check h2 properties
        const test2Results = await page.evaluate(() => {
            const getInputValue = (selector) => {
                const input = document.querySelector(selector);
                return input ? input.value : null;
            };

            const getSelectValue = (selector) => {
                const select = document.querySelector(selector);
                return select ? select.value : null;
            };

            return {
                fontSize: getInputValue('input[onchange*="fontSize"]'),
                fontWeight: getSelectValue('select[onchange*="fontWeight"]'),
                color: getInputValue('input[type="color"][onchange*="color"][onchange*="updateStyle"]')
            };
        });

        results.tests.push({
            name: 'Template Styles Reading (H2)',
            passed: test2Results.fontSize === '56px' &&
                   (test2Results.fontWeight === 'bold' || test2Results.fontWeight === '700'),
            details: test2Results,
            logs: logs2
        });

        // Test 3: Check paragraph element
        console.log('\n🧪 Test 3: Testing paragraph element from template...');
        await page.click('p.canvas-element');
        await page.waitForTimeout(500);

        const test3Results = await page.evaluate(() => {
            const getInputValue = (selector) => {
                const input = document.querySelector(selector);
                return input ? input.value : null;
            };

            return {
                fontSize: getInputValue('input[onchange*="fontSize"]'),
                marginTop: getInputValue('input[placeholder="Top"][onchange*="marginTop"]'),
                color: getInputValue('input[type="color"][onchange*="color"][onchange*="updateStyle"]')
            };
        });

        results.tests.push({
            name: 'Template Styles Reading (Paragraph)',
            passed: test3Results.fontSize === '18px' &&
                   test3Results.marginTop === '20',
            details: test3Results
        });

        // Test 4: Check section element (flexbox test)
        console.log('\n🧪 Test 4: Testing section element with spacing...');
        await page.click('section.canvas-element');
        await page.waitForTimeout(500);

        const test4Results = await page.evaluate(() => {
            const getInputValue = (selector) => {
                const input = document.querySelector(selector);
                return input ? input.value : null;
            };

            return {
                paddingTop: getInputValue('input[placeholder="Top"][onchange*="paddingTop"]'),
                paddingRight: getInputValue('input[placeholder="Right"][onchange*="paddingRight"]'),
                paddingBottom: getInputValue('input[placeholder="Bottom"][onchange*="paddingBottom"]'),
                paddingLeft: getInputValue('input[placeholder="Left"][onchange*="paddingLeft"]'),
                backgroundColor: getInputValue('input[type="color"][onchange*="backgroundColor"]')
            };
        });

        results.tests.push({
            name: 'Section Spacing & Background',
            passed: test4Results.paddingTop === '80' &&
                   test4Results.paddingRight === '20' &&
                   test4Results.backgroundColor === '#f7fafc',
            details: test4Results
        });

        // Test 5: Modify property and verify it persists
        console.log('\n🧪 Test 5: Modifying properties and verifying persistence...');
        await page.evaluate(() => {
            // Change font size
            const fontSizeInput = document.querySelector('input[onchange*="fontSize"]');
            if (fontSizeInput) {
                fontSizeInput.value = '72px';
                fontSizeInput.dispatchEvent(new Event('change'));
            }
        });

        await page.waitForTimeout(500);

        // Deselect and reselect
        await page.click('#canvas');
        await page.waitForTimeout(200);
        await page.click('h2.canvas-element');
        await page.waitForTimeout(500);

        const test5Results = await page.evaluate(() => {
            const fontSizeInput = document.querySelector('input[onchange*="fontSize"]');
            const h2Element = document.querySelector('h2.canvas-element');
            return {
                inputValue: fontSizeInput ? fontSizeInput.value : null,
                computedFontSize: h2Element ? window.getComputedStyle(h2Element).fontSize : null,
                inlineStyle: h2Element ? h2Element.style.fontSize : null
            };
        });

        results.tests.push({
            name: 'Property Modification Persistence',
            passed: test5Results.inputValue === '72px' &&
                   test5Results.computedFontSize === '72px',
            details: test5Results
        });

        // Take screenshots
        console.log('\n📸 Taking screenshots...');
        await page.screenshot({
            path: 'test-results/properties-panel-overview.png',
            fullPage: true
        });

        // Focus on properties panel
        await page.evaluate(() => {
            const panel = document.getElementById('properties-panel');
            if (panel) {
                panel.scrollIntoView();
            }
        });

        await page.screenshot({
            path: 'test-results/properties-panel-detail.png',
            clip: { x: 1200, y: 0, width: 720, height: 1080 }
        });

        // Generate summary
        const totalTests = results.tests.length;
        const passedTests = results.tests.filter(t => t.passed).length;
        results.summary = {
            total: totalTests,
            passed: passedTests,
            failed: totalTests - passedTests,
            successRate: ((passedTests / totalTests) * 100).toFixed(1) + '%'
        };

        console.log('\n📊 Test Results Summary:');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${totalTests - passedTests}`);
        console.log(`Success Rate: ${results.summary.successRate}`);

    } catch (error) {
        console.error('❌ Test error:', error);
        results.error = error.message;
    }

    // Save results
    await fs.mkdir('test-results', { recursive: true });
    await fs.writeFile(
        'test-results/properties-panel-test.json',
        JSON.stringify(results, null, 2)
    );

    await browser.close();

    return results;
}

// Check if puppeteer is available
(async () => {
    try {
        require.resolve('puppeteer');
        await testPropertiesPanel();
    } catch(e) {
        console.log('⚠️  Puppeteer not installed. Running manual validation steps...\n');
        console.log('📋 Manual Validation Checklist:\n');
        console.log('1. Open http://localhost:3030 in browser');
        console.log('2. Create a new element or load a template');
        console.log('3. Click on any element to select it');
        console.log('4. Open Properties Panel (Ctrl+P)');
        console.log('5. Verify that CSS values are displayed correctly');
        console.log('6. Check console for debug logs showing property loading');
        console.log('7. Modify a property and verify it applies');
        console.log('8. Deselect and reselect element to verify persistence\n');
        console.log('Expected: All property values should load from getComputedStyle');
    }
})();