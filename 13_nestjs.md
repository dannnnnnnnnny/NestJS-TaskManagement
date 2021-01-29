# JEST를 이용한 Testing
- JEST 프레임워크 사용
- package.json -> test 명령어 => "jest"
- src/example.spec.ts 생성
- yarn test:watch

### 친구 목록 초기화 테스트
```ts
// example.spec.ts
// feature
class FriendsList {
  friends = [];

  addFriend(name) {
    this.friends.push(name);
  }
}

// tests
describe('FriendsList', () => {
  it('initializes friends list', () => {
    const friendsList = new FriendsList();
    expect(friendsList.friends.length).toEqual(0);
  });

  it('adds a friend to the list', () => {
    friendsList.addFriend('Ariel');
    expect(friendsList.friends.length).toEqual(1);
  });
});
```
- FriendsList 인스턴스를 생성하고, 생성된 firendsList는 length가 0이라면 제대로 초기화된 것이므로
- 추가하고 length가 1이면 잘 추가된 것이므로

### 호출되었는지 확인
```ts
it('announces friendship', () => {
  const friendsList = new FriendsList();
  friendsList.announceFriendship = jest.fn();
  expect(friendsList.announceFriendship).not.toHaveBeenCalled();
  friendsList.addFriend('Ariel');
  expect(friendsList.announceFriendship).toHaveBeenCalled();
});
```
- jest.fn() 모의함수를 이용해서 호출된 횟수를 추적할 수 있음.
- .toHaveBeenCalled()를 통해 호출되었는지 확인 (.not.toHaveBeenCalled()도 가능)

```ts
expect(friendsList.announceFriendship).toHaveBeenCalledWith('Ariel');
```
- toHaveBeenCalledWith() 를 통해 해당 Ariel을 추가하고 호출했을 것을 예상할 수 있음

### 인스턴스 초기화 해주는 공동 작업 따로 빼주기
```ts
// tests
describe('FriendsList', () => {
  let friendsList;

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
    friendsList.announceFriendship = jest.fn();
    expect(friendsList.announceFriendship).not.toHaveBeenCalled();
    friendsList.addFriend('Ariel');
    expect(friendsList.announceFriendship).toHaveBeenCalledWith('Ariel');
  });
});
```
- 중복되는 인스턴스 생성작업을 따로 let 변수로 빼주고, beforeEach()를 통해서 분리할 수 있음

### 삭제, 에러처리 테스트
```ts
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
    friendsList.announceFriendship = jest.fn();
    expect(friendsList.announceFriendship).not.toHaveBeenCalled();
    friendsList.addFriend('Ariel');
    expect(friendsList.announceFriendship).toHaveBeenCalledWith('Ariel');
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

```
- 삭제할 name의 idx를 구해서 없으면(-1이면) 에러 발생
- 삭제 후 splice로 덮어씌움
- expect(friendsList.friends[0]).toBeUndefined(); : 삭제 후에 Undefined가 되었는지 확인
- expect(() => friendsList.removeFriend('Ariel')).toThrow(); : 구체적으로 어떤 에러를 던질 것인지 확인 가능