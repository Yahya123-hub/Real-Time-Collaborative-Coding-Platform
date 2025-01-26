import { test, expect } from '@playwright/test';

async function roomcreation(page, roomid, username) {

  await page.goto("http://localhost:3000/");
  await page.locator('input[placeholder="ROOM ID"]').fill(roomid.toString());
  await page.locator('role=textbox[name="USERNAME"]').fill(username.toString());
  await page.locator('text=Join').click();
}

async function validationtestgeneric(page, roomid, username){
  await roomcreation(page, roomid, username);
  await expect(page).toHaveURL("http://localhost:3000/");

}

test('User can create a room', async ({page}) => {
  const roomid = 12345
  await roomcreation(page, roomid, "Yahya");
  await expect(page).toHaveURL(new RegExp(`/editor/${roomid}`));
  await expect(page.locator('role=presentation')).toHaveText('');

});

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
  await roomcreation(page, "123456", "Yahya");
  await roomcreation(page, "123456", "Ahmed");

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


    
test("User can copy room id", async ({page}) =>{
  await roomcreation(page, "12345", "Yahya");
  await page.locator('text=Copy ROOM ID').click();

  const alertDiv = await page.locator('div[role="status"][aria-live="polite"]').textContent();
  await expect(alertDiv).toEqual("Room ID has been copied to your clipboard")

})

test("User can leave room", async ({page}) =>{
  await roomcreation(page, "12345", "Yahya");
  await page.locator('text=Leave').click();
  await expect(page.url()).toEqual("http://localhost:3000/");

})

test("Code editor should be empty for a new room", async({page})=>{
  await roomcreation(page, "12345", "Yahya");
  await expect(page.locator('role=presentation')).toHaveText('');

});



test("User can select a language", async({page})=>{


  await roomcreation(page, "1234", "Yahya");
  const select = await page.locator('select');
  await select.selectOption("typescript");
  const val = await select.inputValue();
  await expect(val).toBe('typescript');

})

test("Dropdown languages synchronizes across users in the room", async ({browser}) =>{
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();

  const context2= await browser.newContext();
  const page2 = await context2.newPage();

  await roomcreation(page1, "12345", "Yahya");
  await roomcreation(page2, "12345", "Ahmed"); 

  const selector1= await page1.locator('select');
  await selector1.selectOption('typescript');

  await page2.waitForTimeout(500); 

  const selector2 = await page2.locator('select');
  await expect(selector2).toHaveValue('typescript')
})

test("User generates correct output for all languages", async ({page})=>{

  const languages = [
    "javascript",
    "typescript",
    "python",
    "ruby",
    "rust",
    "csharp",
    "cpp",
    "go",
    "java",
    "c"
  ];

  await roomcreation(page, "12345", "Yahya");
  for(const lang of languages){
    await page.locator('select').selectOption(lang);
    await page.locator('text=Run Code').click();
    //verify the output of boiler code for each lang which is a simple 3+4 function
    //output should be 7
    await expect(page.locator('pre')).toHaveText("7");
  }

})

test("Code changes/New user synchronization", async ({browser}) => {

  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  const context2 = await browser.newContext();
  const page2 = await context2.newPage();

  await roomcreation(page1,"1234", "User1");
  await page1.locator('role=presentation').type("This is from user1"); 
  await roomcreation(page2, "1234", "User2");
  await page2.locator('role=presentation').waitFor();
  await expect(page2.locator('role=presentation')).toHaveText("This is from user1");
})

test("Simultaneous code edits sync", async ({browser}) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  const context2 = await browser.newContext();
  const page2 = await context2.newPage();

  await roomcreation(page1, "12345", "User1");
  await roomcreation(page2, "12345", "User2");

  await page1.locator('select').selectOption('typescript');
  await page2.locator('select').selectOption('typescript');

  const user1TypingPromise = page1.locator('role=presentation').type("This is from User1", { delay: 50 });
  const user2TypingPromise = page2.locator('role=presentation').type("This is from User2", { delay: 50 });

  await Promise.all([user1TypingPromise, user2TypingPromise]);

  // Assert that both changes are reflected without race conditions (both users should see each other's edits)
  await expect(page1.locator('role=presentation')).toHaveText("This is from User1This is from User2");
  await expect(page2.locator('role=presentation')).toHaveText("This is from User1This is from User2");
});
