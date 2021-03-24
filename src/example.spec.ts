describe('my test', () => {
  it('returns true', () => {
    expect(true).toEqual(true);
  });
});

// feature
class FriendsList {
  friends = [];

  addFriend(name) {
    this.friends.push(name);
    this.announceFriendship(name);
  }

  announceFriendship(name) {
    global.console.log(`${name} is now a friend!`);
  }

  removeFriend(name) {
    const idx = this.friends.indexOf(name);
    if (idx === -1) {
      throw new Error('Friend not found!');
    }
    this.friends.splice(idx, 1);
  }
}

// tests
describe('FriendsList', () => {
  let friendsList;

  // 테스트 전에 실행됨
  beforeEach(() => {
    friendsList = new FriendsList();
  });

  it('initializes friends list', () => {
    expect(friendsList.friends.length).toEqual(0);
  });

  it('adds a friend to the list', () => {
    friendsList.addFriend('Ariel');
    expect(friendsList.friends.length).toEqual(1);
  });

  it('announces friendship', () => {
    friendsList.announceFriendship = jest.fn(); // 모의함수가 호출량을 체크함
    expect(friendsList.announceFriendship).not.toHaveBeenCalled(); // 호출하지 않았으므로
    friendsList.addFriend('danny');
    expect(friendsList.announceFriendship).toHaveBeenCalledTimes(1); // 호출 몇번 했는지
    expect(friendsList.announceFriendship).toBeCalled(); // 호출됐는지
    friendsList.addFriend('Ariel');
    expect(friendsList.announceFriendship).toHaveBeenCalledWith('Ariel'); // 어떤 파라미터와 호출했는지
    expect(friendsList.friends.length).toBeGreaterThanOrEqual(2); // 2보다 크거나 같음
  });

  describe('removeFriend', () => {
    it('removes a friend from the list', () => {
      friendsList.addFriend('Ariel');
      expect(friendsList.friends[0]).toEqual('Ariel');
      friendsList.removeFriend('Ariel');
      expect(friendsList.friends[0]).toBeUndefined();
    });
    it('throws an error as friend does not exist', () => {
      expect(() => friendsList.removeFriend('Ariel')).toThrow(new Error('Friend not found!'));
    });
  });
});
