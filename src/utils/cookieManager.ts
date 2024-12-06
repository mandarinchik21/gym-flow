import Cookies from 'js-cookie';

class CookieManager {
  static setItem(
      name: string,
      value: string,
      expires: number = Date.now() + 31449600, // 1 year by default
  ) {
    Cookies.set(name, value, {
      domain: window.location.hostname,
      expires: new Date(expires * 1000),
      secure: true,
      sameSite: 'strict',
    });
  }

  static getItem(name: string): string | undefined {
    return Cookies.get(name);
  }

  static removeItem(name: string) {
    Cookies.remove(name, {
      domain: window.location.hostname,
    });
  }

  static clear() {
    const cookies = Object.keys(Cookies.get());

    for (const cookie of cookies) {
      Cookies.remove(cookie, {
        domain: window.location.hostname,
      });
    }
  }
}

export default CookieManager;
