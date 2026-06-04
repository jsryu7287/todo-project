const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = `file://${path.resolve(__dirname, 'index.html')}`;

test.describe('Todo 일정관리 앱', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FILE_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('1. 페이지 로드 - 제목과 입력창이 보인다', async ({ page }) => {
    await expect(page).toHaveTitle('Todo 일정관리');
    await expect(page.locator('h1')).toContainText('Todo 일정관리');
    await expect(page.locator('#todoInput')).toBeVisible();
    await expect(page.locator('#addBtn')).toBeVisible();
  });

  test('2. 할 일 추가 - 버튼 클릭으로 추가', async ({ page }) => {
    await page.fill('#todoInput', '장보기');
    await page.click('#addBtn');
    const items = page.locator('.todo-item');
    await expect(items).toHaveCount(1);
    await expect(items.first().locator('.todo-text')).toHaveText('장보기');
    await expect(page.locator('#todoInput')).toHaveValue('');
  });

  test('3. 할 일 추가 - Enter 키로 추가', async ({ page }) => {
    await page.fill('#todoInput', '운동하기');
    await page.press('#todoInput', 'Enter');
    await expect(page.locator('.todo-item')).toHaveCount(1);
    await expect(page.locator('.todo-text').first()).toHaveText('운동하기');
  });

  test('4. 여러 개 추가 - 목록에 쌓인다', async ({ page }) => {
    const tasks = ['독서', '코딩 공부', '청소'];
    for (const task of tasks) {
      await page.fill('#todoInput', task);
      await page.press('#todoInput', 'Enter');
    }
    await expect(page.locator('.todo-item')).toHaveCount(3);
  });

  test('5. 완료 체크 - 체크하면 취소선이 생긴다', async ({ page }) => {
    await page.fill('#todoInput', '이메일 확인');
    await page.press('#todoInput', 'Enter');
    const item = page.locator('.todo-item').first();
    await expect(item).not.toHaveClass(/done/);
    await item.locator('input[type="checkbox"]').check();
    await expect(item).toHaveClass(/done/);
  });

  test('6. 완료 체크 해제 - 다시 미완료 상태로 돌아온다', async ({ page }) => {
    await page.fill('#todoInput', '회의 참석');
    await page.press('#todoInput', 'Enter');
    const cb = page.locator('.todo-item input[type="checkbox"]').first();
    await cb.check();
    await cb.uncheck();
    await expect(page.locator('.todo-item').first()).not.toHaveClass(/done/);
  });

  test('7. 삭제 - 삭제 버튼 클릭으로 항목 제거', async ({ page }) => {
    await page.fill('#todoInput', '삭제할 항목');
    await page.press('#todoInput', 'Enter');
    await expect(page.locator('.todo-item')).toHaveCount(1);
    await page.locator('.delete-btn').first().click();
    await expect(page.locator('.todo-item')).toHaveCount(0);
    await expect(page.locator('.empty-msg')).toBeVisible();
  });

  test('8. 여러 항목 중 특정 항목만 삭제', async ({ page }) => {
    await page.fill('#todoInput', '항목 A');
    await page.press('#todoInput', 'Enter');
    await page.fill('#todoInput', '항목 B');
    await page.press('#todoInput', 'Enter');
    await page.fill('#todoInput', '항목 C');
    await page.press('#todoInput', 'Enter');
    await page.locator('.delete-btn').first().click();
    await expect(page.locator('.todo-item')).toHaveCount(2);
    await expect(page.locator('.todo-text').first()).toHaveText('항목 B');
  });

  test('9. 필터 - 미완료만 보기', async ({ page }) => {
    await page.fill('#todoInput', '미완료 항목');
    await page.press('#todoInput', 'Enter');
    await page.fill('#todoInput', '완료할 항목');
    await page.press('#todoInput', 'Enter');
    await page.locator('.todo-item input[type="checkbox"]').first().check();
    await page.click('[data-filter="active"]');
    await expect(page.locator('.todo-item')).toHaveCount(1);
    await expect(page.locator('.todo-text').first()).toHaveText('미완료 항목');
  });

  test('10. 필터 - 완료만 보기', async ({ page }) => {
    await page.fill('#todoInput', '미완료 항목');
    await page.press('#todoInput', 'Enter');
    await page.fill('#todoInput', '완료된 항목');
    await page.press('#todoInput', 'Enter');
    await page.locator('.todo-item input[type="checkbox"]').first().check();
    await page.click('[data-filter="done"]');
    await expect(page.locator('.todo-item')).toHaveCount(1);
    await expect(page.locator('.todo-text').first()).toHaveText('완료된 항목');
  });

  test('11. 필터 - 전체 보기로 복귀', async ({ page }) => {
    await page.fill('#todoInput', '항목 1');
    await page.press('#todoInput', 'Enter');
    await page.fill('#todoInput', '항목 2');
    await page.press('#todoInput', 'Enter');
    await page.locator('.todo-item input[type="checkbox"]').first().check();
    await page.click('[data-filter="done"]');
    await page.click('[data-filter="all"]');
    await expect(page.locator('.todo-item')).toHaveCount(2);
  });

  test('12. 통계 - 완료/전체 카운트 표시', async ({ page }) => {
    await page.fill('#todoInput', '항목 A');
    await page.press('#todoInput', 'Enter');
    await page.fill('#todoInput', '항목 B');
    await page.press('#todoInput', 'Enter');
    await page.locator('.todo-item input[type="checkbox"]').first().check();
    const stats = page.locator('#stats');
    await expect(stats).toContainText('완료 1');
    await expect(stats).toContainText('전체 2');
  });

  test('13. 빈 입력 무시 - 공백만 입력하면 추가 안 됨', async ({ page }) => {
    await page.fill('#todoInput', '   ');
    await page.click('#addBtn');
    await expect(page.locator('.todo-item')).toHaveCount(0);
  });

  test('14. localStorage 유지 - 새로고침 후에도 데이터 보존', async ({ page }) => {
    await page.fill('#todoInput', '영속 항목');
    await page.press('#todoInput', 'Enter');
    await page.reload();
    await expect(page.locator('.todo-item')).toHaveCount(1);
    await expect(page.locator('.todo-text').first()).toHaveText('영속 항목');
  });
});