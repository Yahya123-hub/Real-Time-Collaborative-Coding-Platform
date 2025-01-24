import { test, expect } from '@playwright/test';
import { toContainElement } from '@testing-library/jest-dom/matchers';

test('User can create a room', async ({page}) => {

  await page.goto("http://localhost:3000/");

  const roomid = 12345

  await page.fill('input[placeholder="ROOM ID"]', roomid.toString());
  await page.locator('role=textbox[name="USERNAME"]').fill("yahya");

  await page.click('text=Join');

  await expect(page).toHaveURL(new RegExp(`/editor/${roomid}`));
  await expect(page.locator('role=presentation')).toHaveText('');

});

async function validationtestgeneric(page, roomid, username){

  const initialurl = "http://localhost:3000/"
  await page.goto(initialurl);
  await page.fill('input[placeholder="ROOM ID"]', roomid.toString());
  await page.locator('role=textbox[name="USERNAME"]').fill(username.toString());
  await page.click('text=Join');
  await expect(page.url()).toEqual(initialurl);

}

test('Validation test - spaces' , async ({page}) =>{
await validationtestgeneric(page," ", " ");
})

test('Validation test - special chars' , async ({page}) =>{
  await validationtestgeneric(page,"!$!##%%#@%%^", "@%@^#$@^#$^#$^");
})

test('Room ID Field should be read and paste only', async ({page})=>{
  await page.goto("http://localhost:3000/");
  await expect(page.locator('input[placeholder="ROOM ID"]')).toBeDisabled();
  //user shouldnt be able to enter ids manually only through pasting or clicking generate new room id
})

test('New Room id is assigned correctly', async ({page})=>{

  await page.goto("http://localhost:3000/");
  await page.locator('text="new room"').click();
  await expect(page.locator('input[placeholder="ROOM ID"]')).toHaveText(/.*/);
})

test('No same usernames in one room', async({page}) =>{
  await page.goto("http://localhost:3000/");
  await page.locator('input[placeholder="ROOM ID"]').fill("123456")
  await page.locator('role=textbox[name="USERNAME"]').fill("Yahya");
  await page.locator('text=Join').click();

  await page.goto("http://localhost:3000/");
  await page.locator('input[placeholder="ROOM ID"]').fill("123456");
  await page.locator('role=textbox[name="USERNAME"]').fill("Yahya");
  await page.locator('text=Join').click();  


  await expect(page.url()).toEqual("http://localhost:3000/");
  //user will stay at same intialurl 
  //if same usernames r not allowed in one room then error message 
  //should stop the user from joining the room with the same name
  //as other user in the room

})


test('Users can join existing room', async ({browser}) =>{
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  
  await page1.goto("http://localhost:3000/");
  await page2.goto("http://localhost:3000/"); 

  await roomcreation(page1, "123456", "Yahya");
  await roomcreation(page2, "123456", "Ahmed");
  
  const clientlistp1= await page1.locator('.clientsList').textContent();
  console.log(clientlistp1)

  const clientlistp2= await page2.locator('.clientsList').textContent();
  console.log(clientlistp2)

  await expect(clientlistp1).toContain('Yahya');
  await expect(clientlistp1).toContain('Ahmed');

  await expect(clientlistp2).toContain('Ahmed'); 
  await expect(clientlistp2).toContain('Yahya');
  
})

async function roomcreation(page, roomid, username) {

  await page.locator('input[placeholder="ROOM ID"]').fill(roomid.toString());
  await page.locator('role=textbox[name="USERNAME"]').fill(username.toString());
  await page.locator('text=Join').click();

}
    
test("User can copy room id", async ({page}) =>{

  await page.goto("http://localhost:3000/")
  await roomcreation(page, "12345", "Yahya");
  await page.locator('text=Copy ROOM ID').click();

  const alertDiv = await page.locator('div[role="status"][aria-live="polite"]').textContent();
  await expect(alertDiv).toEqual("Room ID has been copied to your clipboard")

})

test("User can leave room", async ({page}) =>{

  await page.goto("http://localhost:3000/")
  await roomcreation(page, "12345", "Yahya");
  await page.locator('text=Leave').click();
  await expect(page.url()).toEqual("http://localhost:3000/");

})

test("Code editor should be empty for a new room", async({page})=>{
  await page.goto("http://localhost:3000/")
  await roomcreation(page, "12345", "Yahya");
  await expect(page.locator('role=presentation')).toHaveText('');

});

/*1Simulate two users editing different parts of the code simultaneously.
Assert no conficts or race conditions occur
2Verify that code changes made by one user are visible to all other users in real time.
3lang selec rt
4output*/

test("User can select a language", async({page})=>{

  await page.goto("http://localhost:3000/")
  await roomcreation(page, "1234", "Yahya");
  const select = await page.locator('select');
  await select.selectOption("typescript");
  const val = await select.inputValue();
  await expect(val).toBe('typescript');

})

test.only("Dropdown languages synchronizes across users in the room", async ({browser}) =>{

  const context1 = await browser.newContext();
  const page1 = await context1.newPage();

  const context2= await browser.newContext();
  const page2 = await context2.newPage();

  await page1.goto("http://localhost:3000/")
  await page2.goto("http://localhost:3000/")

  await roomcreation(page1, "12345", "Yahya");
  await roomcreation(page2, "12345", "Ahmed"); 

  const selector1= await page1.locator('select');
  await selector1.selectOption('typescript');

  await page2.waitForTimeout(500); //susssy

  const selector2 = await page2.locator('select');
  await expect(selector2).toHaveValue('typescript')


})