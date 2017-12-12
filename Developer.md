## Meteor App

### Conventions

- `Meteor.methods`
    - Method names should be descriptive and in the form of `<entity>.<action>`. For example:
        - `userAge.get`
        - `userOccupation.set`
        - `post.delete`
        - `authentication.invalidate`
    - Instead of taking multiple arguments, use a dictionary of arguments so they are named and unordered. For example:

        ```JavaScript
        Meteor.methods({
          'book.find' ({
            author,
            genre,
            publisher,
          }) {
            //...
          },
        });
        ```
