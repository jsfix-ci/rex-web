import createUserLoader, { AccountsUser } from '../../gateways/createUserLoader';

export const testAccountsUser: AccountsUser = {
  first_name: 'testy',
  full_name: 'testy mctesterson',
  id: 1,
  last_name: 'mctesterson',
  name: 'test',
  is_not_gdpr_location: true,
};

export default (): ReturnType<typeof createUserLoader> => ({
  getCurrentUser: () => Promise.resolve(testAccountsUser),
});
