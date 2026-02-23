// Updated inviteCodes.generate function that also creates a teacher account
// This file is for reference - the actual code will be inserted into routers.ts

export const generateInviteCode = `
  generate: publicProcedure
    .input(z.object({
      sessionToken: z.string(),
      description: z.string().optional(),
      maxUses: z.number().min(1).max(100).default(10),
      teacherEmail: z.string().email().optional(),
      teacherName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const teacher = await db.getTeacherAccountBySessionToken(input.sessionToken);
      if (!teacher) return { success: false, message: "Acesso negado" } as const;
      
      // Generate random 8-char code
      const code = "FARM" + crypto.randomBytes(3).toString("hex").toUpperCase().slice(0, 4);
      
      // Create invite code
      const id = await db.createInviteCode({
        code,
        description: input.description || "Código gerado por " + teacher.name,
        maxUses: input.maxUses,
        createdBy: teacher.email,
      });
      
      // If teacher email and name provided, create a new teacher account
      let newTeacherId = null;
      let newTeacherSessionToken = null;
      if (input.teacherEmail && input.teacherName) {
        try {
          // Check if email already exists
          const existingTeacher = await db.getTeacherAccountByEmail(input.teacherEmail);
          if (!existingTeacher) {
            // Generate temporary password
            const tempPassword = crypto.randomBytes(8).toString("hex");
            const passwordHash = await bcrypt.hash(tempPassword, 10);
            
            // Create new teacher account
            newTeacherId = await db.createTeacherAccount({
              email: input.teacherEmail,
              name: input.teacherName,
              passwordHash,
              isActive: 1,
            });
            
            // Generate session token for new teacher
            newTeacherSessionToken = crypto.randomBytes(32).toString("hex");
            await db.updateTeacherSessionToken(newTeacherId, newTeacherSessionToken);
            
            // Send notification to owner about new teacher
            sendNotificationAsync(
              "👨‍🏫 Novo Professor Criado via Código de Acesso",
              \`\${input.teacherName} (\${input.teacherEmail}) foi criado como professor. Senha temporária: \${tempPassword}\`
            );
          }
        } catch (err) {
          console.error("[inviteCodes.generate] Erro ao criar professor:", err);
        }
      }
      
      return { 
        success: true, 
        code, 
        id,
        newTeacherId,
        newTeacherSessionToken,
      } as const;
    }),
`;
