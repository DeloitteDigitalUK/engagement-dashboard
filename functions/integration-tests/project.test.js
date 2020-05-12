/* eslint-disable no-await-in-loop */
const { setup, tearDown } = require('./helpers');
const { Project, UpdateTypes, Roles } = require('models');

const coll = Project.getCollectionPath();

afterAll(async () => {
  await tearDown();
});

describe('conversion', () => {

  test('can write and read back using converter', async () => {
    const db = await setup({
      uid: '123',
      email: 'test@example.org',
    });
    
    const p1 = new Project(null, {
      name: "My project",
      description: "A description",
      updateTypes: [UpdateTypes.insights],
      teams: ['Alpha', 'Beta'],
      roles: {
        'test@example.org': Roles.owner
      },
      tokens: [{
        uid: '123',
        role: Roles.author,
        creationDate: new Date(2020, 0, 1),
        name: "Test token"
      }]
    });
  
    const ref = await db.collection(coll).withConverter(Project).add(p1);
    const doc = await ref.get();
    const p2 = doc.data();
  
    expect(ref.id).toEqual(p2.id);
    expect(p1.toObject()).toEqual(p2.toObject());
  });
  
  test('writes owner and normalised email addresses', async () => {
    const db = await setup({
      uid: '123',
      email: 'test@example.org',
    });
    
    const p1 = new Project(null, {
      name: "My project",
      description: "A description",
      updateTypes: [UpdateTypes.insights],
      teams: [],
      roles: {
        'test@example.org': Roles.owner
      },
      tokens: []
    });
  
    const ref = await db.collection(coll).withConverter(Project).add(p1);
    const doc = await db.collection(coll).doc(ref.id).get();
  
    expect(doc.data()).toEqual({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    });
  });

  test('can recover a broken object', async () => {
    const db = await setup({
        uid: '123',
        email: 'test@example.org'
      }, {
        [`${coll}/123`]: {
          name: "My project",
          description: "A description",
          owner: "test@example@@org",
          updateTypes: ['not valid'],
          teams: [],
          roles: {
            "test@example@@org": Roles.owner,
          },
        }
      });
    
    // hide expected error logging
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const p1 = (await db.doc(`${coll}/123`).withConverter(Project).get()).data();
    spy.mockRestore();

    expect(p1.error).toBeTruthy();
    expect(p1.toObject()).toEqual({
      name: "My project",
      description: "A description",
      updateTypes: ['not valid'],
      teams: [],
      roles: {
        "test@example.org": Roles.owner,
      },
      tokens: []
    });

  });

});

describe('role checks', () => {

  test('must be authenticated to add', async () => {
    const db = await setup();
    
    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: "rouge@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "rouge@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

  });
  
  test('user must be owner to add', async () => {
    const db = await setup({
      uid: '321',
      email: 'rouge@example.org',
    });
    
    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: "rouge@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "rouge@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeAllowed();

  });

  test('owner must match to add', async () => {
    const db = await setup({
      uid: '321',
      email: 'rouge@example.org',
    });

    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "rogue@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: "rogue@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: 'rouge@example@@org',
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        'rouge@example@@org': Roles.owner,
      },
      tokens: []
    })).toBeAllowed();
  });

  test('anonymous cannot view', async () => {
    const db = await setup(null, {
      [`${coll}/123`]: {
        name: "My project",
        description: "A description",
        owner: "test@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test@example@@org": Roles.owner,
        },
        tokens: []
      }
    });
    
    await expect(db.collection(coll).doc('123').get()).toBeDenied();
  });

  test('can view with any role', async () => {
    const db = await setup({
      uid: '123',
      email: 'test@example.org',
    }, {
      [`${coll}/1`]: {
        name: "My project",
        description: "A description",
        owner: "test@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test@example@@org": Roles.owner,
        },
        tokens: []
      },
      [`${coll}/2`]: {
        name: "My project",
        description: "A description",
        owner: "test2@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test2@example@@org": Roles.owner,
          "test@example@@org": Roles.administrator,
        },
        tokens: []
      },
      [`${coll}/3`]: {
        name: "My project",
        description: "A description",
        owner: "test2@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test2@example@@org": Roles.owner,
          "test@example@@org": Roles.author,
        },
        tokens: []
      },
      [`${coll}/4`]: {
        name: "My project",
        description: "A description",
        owner: "test2@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test2@example@@org": Roles.owner,
          "test@example@@org": Roles.member,
        },
      },
      [`${coll}/5`]: {
        name: "My project",
        description: "A description",
        owner: "test2@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test2@example@@org": Roles.owner,
        },
        tokens: []
      },
    });
    
    await expect(db.collection(coll).doc('1').get()).toBeAllowed();
    await expect(db.collection(coll).doc('2').get()).toBeAllowed();
    await expect(db.collection(coll).doc('3').get()).toBeAllowed();
    await expect(db.collection(coll).doc('4').get()).toBeAllowed();
    await expect(db.collection(coll).doc('5').get()).toBeDenied();
  });

  test('only owner can delete', async () => {
    const db = await setup({
      uid: '123',
      email: 'test@example.org',
    }, {
      [`${coll}/1`]: {
        name: "My project",
        description: "A description",
        owner: "test@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test@example@@org": Roles.owner,
        },
        tokens: []
      },
      [`${coll}/2`]: {
        name: "My project",
        description: "A description",
        owner: "test2@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test2@example@@org": Roles.owner,
          "test@example@@org": Roles.administrator,
        },
        tokens: []
      },
      [`${coll}/3`]: {
        name: "My project",
        description: "A description",
        owner: "test2@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test2@example@@org": Roles.owner,
          "test@example@@org": Roles.author,
        },
        tokens: []
      },
      [`${coll}/4`]: {
        name: "My project",
        description: "A description",
        owner: "test2@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test2@example@@org": Roles.owner,
          "test@example@@org": Roles.member,
        },
        tokens: []
      },
      [`${coll}/5`]: {
        name: "My project",
        description: "A description",
        owner: "test2@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test2@example@@org": Roles.owner,
        },
        tokens: []
      },
    });
    
    await expect(db.collection(coll).doc('1').delete()).toBeAllowed();
    await expect(db.collection(coll).doc('2').delete()).toBeDenied();
    await expect(db.collection(coll).doc('3').delete()).toBeDenied();
    await expect(db.collection(coll).doc('4').delete()).toBeDenied();
    await expect(db.collection(coll).doc('5').delete()).toBeDenied();
  });

  test('owner and administrator can edit', async () => {
    const db = await setup({
      uid: '123',
      email: 'test@example.org',
    }, {
      [`${coll}/1`]: {
        name: "My project",
        description: "A description",
        owner: "test@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test@example@@org": Roles.owner,
        },
        tokens: []
      },
      [`${coll}/2`]: {
        name: "My project",
        description: "A description",
        owner: "test2@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test2@example@@org": Roles.owner,
          "test@example@@org": Roles.administrator,
        },
        tokens: []
      },
      [`${coll}/3`]: {
        name: "My project",
        description: "A description",
        owner: "test2@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test2@example@@org": Roles.owner,
          "test@example@@org": Roles.author,
        },
        tokens: []
      },
      [`${coll}/4`]: {
        name: "My project",
        description: "A description",
        owner: "test2@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test2@example@@org": Roles.owner,
          "test@example@@org": Roles.member,
        },
        tokens: []
      },
      [`${coll}/5`]: {
        name: "My project",
        description: "A description",
        owner: "test2@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test2@example@@org": Roles.owner,
        },
        tokens: []
      },
    });
    
    await expect(db.collection(coll).doc('1').update({name: "Your project"})).toBeAllowed();
    await expect(db.collection(coll).doc('2').update({name: "Your project"})).toBeAllowed();
    await expect(db.collection(coll).doc('3').update({name: "Your project"})).toBeDenied();
    await expect(db.collection(coll).doc('4').update({name: "Your project"})).toBeDenied();
    await expect(db.collection(coll).doc('5').update({name: "Your project"})).toBeDenied();
  });

  test('update cannot change owner', async () => {
    const db = await setup({
      uid: '123',
      email: 'test@example.org',
    }, {
      [`${coll}/1`]: {
        name: "My project",
        description: "A description",
        owner: "test@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test@example@@org": Roles.owner,
        },
        tokens: []
      },
      [`${coll}/2`]: {
        name: "My project",
        description: "A description",
        owner: "test2@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test2@example@@org": Roles.owner,
          "test@example@@org": Roles.administrator,
        },
        tokens: []
      },
      [`${coll}/3`]: {
        name: "My project",
        description: "A description",
        owner: "test2@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test2@example@@org": Roles.owner,
          "test@example@@org": Roles.author,
        },
        tokens: []
      },
      [`${coll}/4`]: {
        name: "My project",
        description: "A description",
        owner: "test2@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test2@example@@org": Roles.owner,
          "test@example@@org": Roles.member,
        },
        tokens: []
      },
      [`${coll}/5`]: {
        name: "My project",
        description: "A description",
        owner: "test2@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test2@example@@org": Roles.owner,
        },
        tokens: []
      },
    });
    
    await expect(db.collection(coll).doc('1').update({owner: "test2@example@@org"})).toBeDenied();
    await expect(db.collection(coll).doc('2').update({owner: "test@example@@org"})).toBeDenied();
    await expect(db.collection(coll).doc('3').update({owner: "test@example@@org"})).toBeDenied();
    await expect(db.collection(coll).doc('4').update({owner: "test@example@@org"})).toBeDenied();
    await expect(db.collection(coll).doc('5').update({owner: "test@example@@org"})).toBeDenied();
  });

  test('update cannot change own role', async () => {
    const db = await setup({
      uid: '123',
      email: 'test@example.org',
    }, {
      [`${coll}/1`]: {
        name: "My project",
        description: "A description",
        owner: "test@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test@example@@org": Roles.owner,
        },
        tokens: []
      },
      [`${coll}/2`]: {
        name: "My project",
        description: "A description",
        owner: "test2@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test2@example@@org": Roles.owner,
          "test@example@@org": Roles.administrator,
        },
        tokens: []
      },
      [`${coll}/3`]: {
        name: "My project",
        description: "A description",
        owner: "test2@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test2@example@@org": Roles.owner,
          "test@example@@org": Roles.author,
        },
        tokens: []
      },
      [`${coll}/4`]: {
        name: "My project",
        description: "A description",
        owner: "test2@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test2@example@@org": Roles.owner,
          "test@example@@org": Roles.member,
        },
        tokens: []
      },
    });
    
    await expect(db.collection(coll).doc('1').update({'test.test@example@@org': Roles.member})).toBeDenied();
    await expect(db.collection(coll).doc('2').update({'test.test@example@@org': Roles.member})).toBeDenied();
    await expect(db.collection(coll).doc('3').update({'test.test@example@@org': Roles.member})).toBeDenied();
    await expect(db.collection(coll).doc('4').update({'test.test@example@@org': Roles.author})).toBeDenied();
  });

  test('must have all required keys on add', async () => {
    const db = await setup({
      uid: '123',
      email: 'test@example.org',
    });

    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeAllowed();

    await expect(db.collection(coll).add({
      // name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

    await expect(db.collection(coll).add({
      name: "My project",
      // description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      // owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      // updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      // roles: {
      //   "test@example@@org": Roles.owner,
      // },
      tokens: []
    })).toBeDenied();

  });

  test('must have all required keys on update', async () => {
    const db = await setup({
      uid: '123',
      email: 'test@example.org',
    }, {
      [`${coll}/1`]: {
        name: "My project",
        description: "A description",
        owner: "test@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test@example@@org": Roles.owner,
        },
        tokens: []
      }
    });

    await expect(db.collection(coll).doc('1').set({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeAllowed();

    await expect(db.collection(coll).doc('1').set({
      // name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

    await expect(db.collection(coll).doc('1').set({
      name: "My project",
      // description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

    await expect(db.collection(coll).doc('1').set({
      name: "My project",
      description: "A description",
      // owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

    await expect(db.collection(coll).doc('1').set({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      // updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

    await expect(db.collection(coll).doc('1').set({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      // roles: {
      //   "test@example@@org": Roles.owner,
      // },
      tokens: []
    })).toBeDenied();

  });

  test('cannot have extra keys', async () => {
    const db = await setup({
      uid: '123',
      email: 'test@example.org',
    }, {
      [`${coll}/1`]: {
        name: "My project",
        description: "A description",
        owner: "test@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test@example@@org": Roles.owner,
        },
        tokens: []
      }
    });

    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: [],
      ringer: "bogus"
    })).toBeDenied();

    await expect(db.collection(coll).doc('1').set({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: [],
      ringer: "bogus"
    })).toBeDenied();

  });

  test('name must be a string', async () => {
    const db = await setup({
      uid: '123',
      email: 'test@example.org',
    }, {
      [`${coll}/1`]: {
        name: "My project",
        description: "A description",
        owner: "test@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test@example@@org": Roles.owner,
        },
        tokens: []
      }
    });

    await expect(db.collection(coll).add({
      name: 123,
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

    await expect(db.collection(coll).doc('1').set({
      name: false,
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

  });

  test('description must be a string', async () => {
    const db = await setup({
      uid: '123',
      email: 'test@example.org',
    }, {
      [`${coll}/1`]: {
        name: "My project",
        description: "A description",
        owner: "test@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test@example@@org": Roles.owner,
        },
        tokens: []
      }
    });

    await expect(db.collection(coll).add({
      name: "My project",
      description: 11,
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

    await expect(db.collection(coll).doc('1').set({
      name: "My project",
      description: true,
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

  });

  test('update types must be a list of known values', async () => {
    const db = await setup({
      uid: '123',
      email: 'test@example.org',
    }, {
      [`${coll}/1`]: {
        name: "My project",
        description: "A description",
        owner: "test@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test@example@@org": Roles.owner,
        },
        tokens: []
      }
    });

    // not a list

    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: "foo",
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

    await expect(db.collection(coll).doc('1').set({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: false,
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

    // empty list

    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeAllowed();

    await expect(db.collection(coll).doc('1').set({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeAllowed();


    // list with multiple konwn values

    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights, UpdateTypes.release],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeAllowed();

    await expect(db.collection(coll).doc('1').set({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights, UpdateTypes.release],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeAllowed();
    
    // list with an unknown value

    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights, UpdateTypes.release, 'ringer'],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

    await expect(db.collection(coll).doc('1').set({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights, 'ringer', UpdateTypes.release],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

  });

  test('teams must be a list', async () => {
    const db = await setup({
      uid: '123',
      email: 'test@example.org',
    }, {
      [`${coll}/1`]: {
        name: "My project",
        description: "A description",
        owner: "test@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: ["Foo"],
        roles: {
          "test@example@@org": Roles.owner,
        },
        tokens: []
      }
    });

    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: "Bar",
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

    await expect(db.collection(coll).doc('1').set({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: null,
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeDenied();

    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: ["Bar"],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeAllowed();

    await expect(db.collection(coll).doc('1').set({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: ["Bar"],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: []
    })).toBeAllowed();

  });
  
  test('roles must be a map of known values', async () => {
    const db = await setup({
      uid: '123',
      email: 'test@example.org',
    }, {
      [`${coll}/1`]: {
        name: "My project",
        description: "A description",
        owner: "test@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test@example@@org": Roles.owner,
        },
        tokens: []
      }
    });

    // not a map

    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      roles: "owner",
      tokens: []
    })).toBeDenied();

    await expect(db.collection(coll).doc('1').set({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      roles: 123,
      tokens: []
    })).toBeDenied();

    // empty map (must contain owner role)

    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {},
      tokens: []
    })).toBeDenied();

    await expect(db.collection(coll).doc('1').set({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {},
      tokens: []
    })).toBeDenied();
    
    // map with an unknown value

    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      roles: {
        "test@example@@org": Roles.owner,
        "test2@example@@org": 'root',
      },
      tokens: []
    })).toBeDenied();

    await expect(db.collection(coll).doc('1').set({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      roles: {
        "test@example@@org": Roles.owner,
        "test2@example@@org": 123,
      },
      tokens: []
    })).toBeDenied();

  });

  test('tokens must be a list', async () => {
    const db = await setup({
      uid: '123',
      email: 'test@example.org',
    }, {
      [`${coll}/1`]: {
        name: "My project",
        description: "A description",
        owner: "test@example@@org",
        updateTypes: [UpdateTypes.insights,],
        teams: [],
        roles: {
          "test@example@@org": Roles.owner,
        },
        tokens: [{
          uid: '123',
          role: Roles.author,
          creationDate: new Date(2020, 0, 1),
          name: "Foo"
        }]
      }
    });

    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: "Bar"
    })).toBeDenied();

    await expect(db.collection(coll).doc('1').set({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: null
    })).toBeDenied();

    await expect(db.collection(coll).add({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: [{
        uid: '321',
        role: Roles.author,
        creationDate: new Date(2020, 0, 1),
        name: "Bar"
      }]
    })).toBeAllowed();

    await expect(db.collection(coll).doc('1').set({
      name: "My project",
      description: "A description",
      owner: "test@example@@org",
      updateTypes: [UpdateTypes.insights,],
      teams: [],
      roles: {
        "test@example@@org": Roles.owner,
      },
      tokens: [{
        uid: '321',
        role: Roles.author,
        creationDate: new Date(2020, 0, 1),
        name: "Bar"
      }]
    })).toBeAllowed();

  });

  test('anonymous cannot view non-existent project', async () => {
    const db = await setup();

    const p1 = new Project('p1', {
      name: "My project",
      description: "A description",
      updateTypes: [UpdateTypes.insights],
      teams: [],
      roles: {
        'test@example.org': Roles.owner
      },
      tokens: []
    });
    
    await expect(db.doc(p1.getPath()).get()).toBeDenied();
    
  });

  test('authenticated can view non-existent project', async () => {
    const db = await setup({
      uid: '123',
      email: 'test@example.org',
    });

    const p1 = new Project('p1', {
      name: "My project",
      description: "A description",
      updateTypes: [UpdateTypes.insights],
      teams: [],
      roles: {
        'test@example.org': Roles.owner
      },
      tokens: []
    });
    
    await expect(db.doc(p1.getPath()).get()).toBeAllowed();
    expect((await db.doc(p1.getPath()).get()).exists).toEqual(false);
  });
  
    
});
