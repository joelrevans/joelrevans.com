CREATE TABLE [dbo].[Images]
(
    [Data] VARBINARY(MAX) NOT NULL, 
    [Width] INT NOT NULL, 
    [Height] INT NOT NULL, 
    [Path] VARCHAR(255) NOT NULL, 
    [Format] as (Reverse(substring(Reverse(Path), 0, CharIndex('.', Reverse(Path)))))
)

GO