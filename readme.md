Basically to set up Prisma using MySql
i used PHPMyAdmin
where i started server for apache and mysql

after starting server i created 
schema.prisma(actually it got created automatically when i used prisma init)
inside that folder we had
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

after this i created models which are like the table structure in my database and when i used 
"npx prisma db push"

i synced both my models and actual tables in my db using prisma

To create add post functionality to add in the desc section we used form in html and onsubmit with this function below

    const {userId} = auth();
    console.log(userId)
    const testAction = async (formData:FormData) => {
         "use server"

       // if not authenticated return
       if (!userId) {
           return;
        }

       const desc = formData.get("desc") as string;
       try {
           const res = await prisma.post.create({
            data: {
                userId:userId,
                desc: desc,
            },
        });

        console.log(res)

        }catch (error) {
           console.log(error)
        }
    }