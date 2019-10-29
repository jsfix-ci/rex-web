from pages.content import Content
from pages.accounts import Login
from tests import markers

from time import sleep


@markers.test_case("C477326", "C477327")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_login_and_logout(selenium, base_url, book_slug, page_slug, email, password):

    # GIVEN: Page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    user_nav = content.navbar
    page_url_before_login = selenium.current_url

    # WHEN: Click on the login link
    user_nav.click_login()

    # THEN: The page navigates to accounts/login
    expected_page_url = base_url + "/accounts/login?r=/books/" + book_slug + "/pages/" + page_slug
    assert expected_page_url == selenium.current_url

    # Login as an existing user
    accounts = Login(selenium)

    accounts.login(email, password)

    # AND: After successful login, redirects back to the preface page
    assert page_url_before_login == selenium.current_url

    # AND: The user menu displayed in the nav includes Account Profile and Logout
    # if content.is_mobile:
    #     user_nav.click_user_name()
    # user_nav.hover_over_user_name()
    #
    # assert user_nav.account_profile_is_displayed
    # user_nav.hover_over_user_name()
    # # sleep(2)
    # assert user_nav.logout_is_displayed
    #
    # # AND: Reloading does not reset the state to logged out
    # selenium.refresh()
    # assert user_nav.user_is_logged_in

    # WHEN: Click the logout link
    if content.is_mobile:
        user_nav.click_user_name()
        user_nav.click_logout()

    if content.is_desktop:
        # user_nav.hover_over_user_name()
        user_nav.click_user_name()
        sleep(4)
        user_nav.click_logout()

    # THEN: The user is logged out
    assert user_nav.user_is_not_logged_in

    # AND: Reloading does not reset the state back to logged in
    selenium.refresh()
    assert user_nav.user_is_not_logged_in
