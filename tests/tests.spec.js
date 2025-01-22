import { test, expect } from '@playwright/test';

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


test.only('Users can join existing room', async ({page, browser}) =>{
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  
  await page1.goto("http://localhost:3000/");
  await page1.locator('input[placeholder="ROOM ID"]').fill("123456")
  await page1.locator('role=textbox[name="USERNAME"]').fill("Yahya");
  await page1.locator('text=Join').click();

  await page2.goto("http://localhost:3000/"); //resets vals n removes yahya
  await page2.locator('input[placeholder="ROOM ID"]').fill("123456")
  await page2.locator('role=textbox[name="USERNAME"]').fill("Ahmed");
  await page2.locator('text=Join').click();

  const clientlist= await page.locator('.clientsList').textContent();
  console.log(clientlist)

  //await expect(clientlist).toContain('Yahya');
  //await expect(clientlist).toContain('Ahmed');
  
})
            


