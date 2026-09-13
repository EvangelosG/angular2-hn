import { Route } from '@angular/router';

import { routes } from './app.routes';
import { ItemDetailsComponent } from './item-details/item-details.component';
import { UserComponent } from './user/user.component';

async function resolveLazyRoute(path: string): Promise<Route[]> {
  const route = routes.find(r => r.path === path);
  expect(route?.loadChildren).toBeDefined();
  return (await route!.loadChildren!()) as Route[];
}

describe('app routes', () => {
  it('redirects the empty path to the first news page', () => {
    expect(routes[0]).toEqual({ path: '', redirectTo: 'news/1', pathMatch: 'full' });
  });

  it('lazily loads the item-details component for /item/:id', async () => {
    const children = await resolveLazyRoute('item');
    expect(children).toHaveLength(1);
    expect(children[0].path).toBe(':id');
    expect(await children[0].loadComponent!()).toBe(ItemDetailsComponent);
  });

  it('lazily loads the user component for /user/:id', async () => {
    const children = await resolveLazyRoute('user');
    expect(children).toHaveLength(1);
    expect(children[0].path).toBe(':id');
    expect(await children[0].loadComponent!()).toBe(UserComponent);
  });
});
